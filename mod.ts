export function getExecPrefix(): string[] {
  const envShell = Deno.env.get("SHELL");
  if (envShell?.endsWith("pwsh.exe") || envShell?.endsWith("powershell.exe")) {
    return [envShell, "-Command"];
  } else if (envShell?.endsWith("cmd.exe")) {
    return [envShell, "/C"];
  } else if (envShell) {
    return [envShell, "-c"];
  } else {
    return ["sh", "-c"];
  }
}

export function exec(command: string): Deno.ChildProcess {
  const [shell, ...args] = getExecPrefix();
  const process = new Deno.Command(shell, {
    args: [...args, command],
    stdout: "piped",
    stderr: "piped",
  });
  return process.spawn();
}

const resetEscapeCode = "\x1b[0m";

const colorEscapeCodes: Record<string, string> = {
  "blue": "\x1b[34m",
  "magenta": "\x1b[35m",
  "orange": "\x1b[33m",
  "cyan": "\x1b[36m",
  "green": "\x1b[32m",
  "lightBlue": "\x1b[94m",
  "lightMagenta": "\x1b[95m",
  "lightCyan": "\x1b[96m",
  "lightOrange": "\x1b[93m",
  "lightGreen": "\x1b[92m",
};

// bold and red
const errorEscapeCode = "\x1b[1m\x1b[31m";

function mergeStreams(streams: ReadableStream[], isStdErr = false) {
  const readers = streams.map((stream) => stream.getReader());
  let outputController: ReadableStreamDefaultController;

  const processStream = (
    reader: ReadableStreamDefaultReader,
    index: number,
    done: () => void,
  ) => {
    reader.read().then(({ value, done: readerDone }) => {
      if (readerDone) {
        done();
      } else {
        const decoded = new TextDecoder().decode(value);
        // const color = ''
        const color = isStdErr ? errorEscapeCode : colorEscapeCodes[
          Object.keys(
            colorEscapeCodes,
          )[index % Object.keys(colorEscapeCodes).length]
        ];
        const encoded = new TextEncoder().encode(
          `${color}[${index}] ${decoded}${resetEscapeCode}`,
        );
        outputController.enqueue(encoded);
        processStream(reader, index, done);
      }
    });
  };

  return new ReadableStream({
    start(controller) {
      outputController = controller;
      let completed = 0;
      readers.forEach((reader, index) => {
        processStream(reader, index, () => {
          completed++;
          if (completed === readers.length) {
            controller.close();
          }
        });
      });
    },
  });
}

// Main function to run the commands
export const concurrently = async (
  commands: string[] = [],
): Promise<void> => {
  if (commands.length === 0) {
    console.error("Please provide at least one shell command.");
    Deno.exit(1);
  }

  const processes = await Promise.all(commands.map((command) => exec(command)));

  mergeStreams(processes.map((process) => process.stdout)).pipeTo(
    Deno.stdout.writable,
  );
  mergeStreams(processes.map((process) => process.stderr)).pipeTo(
    Deno.stderr.writable,
  );

  const statuses = await Promise.allSettled(
    processes.map((process) => process.status),
  );

  if (statuses.some(({ status }) => status === "rejected")) {
    Deno.exit(1);
  } else {
    Deno.exit(0);
  }
};

if (import.meta.main) {
  concurrently(Deno.args);
}

export default concurrently;

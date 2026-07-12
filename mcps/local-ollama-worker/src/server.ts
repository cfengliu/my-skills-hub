import { runLocalModelTask } from "./worker.js";

const serverInfo = {
  name: "local-ollama-worker",
  version: "0.1.0",
};

const tool = {
  name: "run_local_model_task",
  description:
    "Run a bounded local-model coding task in a git repo through nested codex exec and return artifact paths.",
  inputSchema: {
    type: "object",
    properties: {
      task: {
        type: "string",
        description: "Task prompt sent to nested Codex over stdin.",
      },
      repoPath: {
        type: "string",
        description: "Explicit git repository path. Required unless MCP cwd is the target git repo.",
      },
      model: {
        type: "string",
        description: "Optional local OSS model name. Defaults to OLLAMA_WORKER_DEFAULT_MODEL.",
      },
    },
    required: ["task"],
    additionalProperties: false,
  },
};

let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  flushMessages();
});

function flushMessages() {
  while (true) {
    const newline = buffer.indexOf("\n");
    if (newline === -1) return;
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (line) handleMessage(line);
  }
}

async function handleMessage(line) {
  let request;
  try {
    request = JSON.parse(line);
  } catch (error) {
    sendError(null, -32700, "Parse error");
    return;
  }

  try {
    if (request.method === "initialize") {
      sendResult(request.id, {
        protocolVersion: request.params?.protocolVersion ?? "2024-11-05",
        capabilities: { tools: {} },
        serverInfo,
      });
      return;
    }

    if (request.method === "notifications/initialized") {
      return;
    }

    if (request.method === "tools/list") {
      sendResult(request.id, { tools: [tool] });
      return;
    }

    if (request.method === "tools/call") {
      if (request.params?.name !== tool.name) {
        throw new Error(`Unknown tool: ${request.params?.name}`);
      }
      const result = await runLocalModelTask(request.params.arguments || {});
      sendResult(request.id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: result.status !== "completed",
      });
      return;
    }

    sendError(request.id, -32601, `Method not found: ${request.method}`);
  } catch (error) {
    sendResult(request.id, {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : String(error),
        },
      ],
      isError: true,
    });
  }
}

function sendResult(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function sendError(id, code, message) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } })}\n`);
}

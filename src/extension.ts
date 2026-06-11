import * as vscode from "vscode"

const TERMINAL_NAME = "mimocode"

export function activate(context: vscode.ExtensionContext) {
  console.log("[mimocode] extension activated")

  const openNewTerminalDisposable = vscode.commands.registerCommand(
    "mimocode.openNewTerminal",
    async () => {
      console.log("[mimocode] openNewTerminal invoked")
      try {
        await openTerminal()
      } catch (e) {
        vscode.window.showErrorMessage(`mimocode.openNewTerminal: ${e}`)
      }
    }
  )

  const openTerminalDisposable = vscode.commands.registerCommand(
    "mimocode.openTerminal",
    async () => {
      console.log("[mimocode] openTerminal invoked")
      try {
        const existingTerminal = vscode.window.terminals.find(
          (t) => t.name === TERMINAL_NAME
        )
        if (existingTerminal) {
          existingTerminal.show()
          return
        }
        await openTerminal()
      } catch (e) {
        vscode.window.showErrorMessage(`mimocode.openTerminal: ${e}`)
      }
    }
  )

  const addFilepathDisposable = vscode.commands.registerCommand(
    "mimocode.addFilepathToTerminal",
    async () => {
      console.log("[mimocode] addFilepathToTerminal invoked")
      try {
        const fileRef = getActiveFile()
        if (!fileRef) {
          vscode.window.showWarningMessage(
            "No file is open in the active editor."
          )
          return
        }

        const terminal = vscode.window.activeTerminal
        if (!terminal) {
          vscode.window.showWarningMessage("No active terminal found.")
          return
        }

        if (terminal.name === TERMINAL_NAME) {
          // @ts-ignore
          const port = terminal.creationOptions.env?.["_EXTENSION_MIMOCODE_PORT"]
          port
            ? await appendPrompt(parseInt(port), fileRef)
            : terminal.sendText(fileRef, false)
          terminal.show()
          return
        }

        vscode.window.showWarningMessage(
          "Active terminal is not a MiMo Code terminal."
        )
      } catch (e) {
        vscode.window.showErrorMessage(`mimocode.addFilepathToTerminal: ${e}`)
      }
    }
  )

  context.subscriptions.push(
    openNewTerminalDisposable,
    openTerminalDisposable,
    addFilepathDisposable
  )

  async function openTerminal() {
    const port = Math.floor(Math.random() * (65535 - 16384 + 1)) + 16384
    const terminal = vscode.window.createTerminal({
      name: TERMINAL_NAME,
      iconPath: {
        light: vscode.Uri.file(context.asAbsolutePath("images/button-dark.svg")),
        dark: vscode.Uri.file(context.asAbsolutePath("images/button-light.svg")),
      },
      location: {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: false,
      },
      env: {
        _EXTENSION_MIMOCODE_PORT: port.toString(),
        MIMOCODE_CALLER: "vscode",
      },
    })

    terminal.show()
    terminal.sendText(`mimo --port ${port}`)

    const fileRef = getActiveFile()
    if (!fileRef) {
      return
    }

    let tries = 10
    let connected = false
    do {
      await new Promise((resolve) => setTimeout(resolve, 200))
      try {
        await fetch(`http://localhost:${port}/app`)
        connected = true
        break
      } catch {}
      tries--
    } while (tries > 0)

    if (connected) {
      try {
        await appendPrompt(port, `In ${fileRef}`)
      } catch (e) {
        console.error("[mimocode] appendPrompt failed", e)
      }
      terminal.show()
    } else {
      vscode.window.showWarningMessage(
        "Could not connect to MiMo Code. Ensure the `mimocode` CLI is installed."
      )
    }
  }

  async function appendPrompt(port: number, text: string) {
    await fetch(`http://localhost:${port}/tui/append-prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
  }

  function getActiveFile() {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) {
      return
    }

    const document = activeEditor.document
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri)
    if (!workspaceFolder) {
      return
    }

    const relativePath = vscode.workspace.asRelativePath(document.uri)
    let filepathWithAt = `@${relativePath}`

    const selection = activeEditor.selection
    if (!selection.isEmpty) {
      const startLine = selection.start.line + 1
      const endLine = selection.end.line + 1

      if (startLine === endLine) {
        filepathWithAt += `#L${startLine}`
      } else {
        filepathWithAt += `#L${startLine}-${endLine}`
      }
    }

    return filepathWithAt
  }
}

export function deactivate() {}

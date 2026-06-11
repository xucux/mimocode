# MimoCode - VS Code Extension

A Visual Studio Code extension that integrates MimoCode directly into your development workflow.

## Prerequisites

This extension requires the [MiMo Code CLI](https://github.com/XiaomiMiMo/MiMo-Code) to be installed on your system.

```bash
npm install -g @mimo-ai/cli
```

## Features

- **Quick Launch**: Use `Ctrl+Esc` (Windows/Linux) or `Cmd+Esc` (Mac) to open MiMo Code in a split terminal view, or focus an existing terminal session if one is already running.
- **New Session**: Use `Ctrl+Shift+Esc` (Windows/Linux) or `Cmd+Shift+Esc` (Mac) to start a new MiMo Code terminal session, even if one is already open.
- **Context Awareness**: Automatically share your current selection or tab with MiMo Code.
- **File Reference Shortcuts**: Use `Ctrl+Alt+K` (Windows/Linux) or `Cmd+Alt+K` (Mac) to insert file references.

## Commands

| Command | Description |
|---------|-------------|
| `mimocode.openTerminal` | Open MiMo Code (focus existing if running) |
| `mimocode.openNewTerminal` | Open MiMo Code in a new tab |
| `mimocode.addFilepathToTerminal` | Insert file reference at cursor |

## Development

1. Open this directory in VS Code
2. Run `npm install`
3. Press `F5` to start debugging

### Making Changes

TypeScript and esbuild watchers run automatically during debugging. To see changes:

1. Press `Ctrl+Shift+P`
2. Search for `Developer: Reload Window`
3. Reload to see your changes

### Packaging

```bash
npm install -g @vscode/vsce
vsce package
```

This creates a `.vsix` file that can be installed in VS Code.

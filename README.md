# DevSnip – Command Snippets

**Stop googling the same commands. Keep them one click away.**

DevSnip adds a sidebar to VS Code with categorized, ready-to-use CLI commands for Git, npm, Docker, Linux, and more. Click any snippet to copy it instantly — or send it directly into your terminal. Build your own library of custom commands and shortcuts that stay with you across every project.

![DevSnip Commander Demo in VS Code](https://raw.githubusercontent.com/southy404/devsnip/refs/heads/main/media/devsnip.gif)

---

## Features

- **97 built-in snippets** across 5 categories, ready to use from first launch
- **One-click copy** — click any snippet label to copy it to the clipboard instantly
- **Terminal insert** — paste a command directly into your active terminal (without executing)
- **Custom categories** — create named groups for your own commands (Kubernetes, Python, My Scripts, ...)
- **Custom snippets** — add, edit, and delete your own entries with label, command, and description
- **Persistent storage** — all custom data is saved in VS Code settings and syncs via Settings Sync

---

## Built-in Categories

| Category | Snippets | Examples |
|---|---|---|
| 🔀 Git | 34 | commit, rebase, cherry-pick, stash, tags, bisect... |
| 📦 npm | 23 | install, run, audit, publish, npx create-* ... |
| 🐳 Docker | 16 | build, run, compose, exec, prune, push... |
| 🐧 Linux / Shell | 19 | find, grep, curl, tar, ssh, chmod, scp... |
| 💻 VS Code CLI | 5 | open folder, install extension, list extensions... |

---

## Usage

### Copying a snippet
1. Click the **DevSnip icon** in the Activity Bar (left sidebar)
2. Expand a category (e.g. **Git**, **npm**)
3. Click any snippet → copied to clipboard ✅
4. Or click the **terminal icon** on hover → pasted into your active terminal

### Adding custom commands
1. Click **+** at the top of the DevSnip panel → enter a category name
2. Click **+** on any custom category → enter label, command, and optional description
3. Your snippets appear immediately and are available in every future session

### Editing & deleting
- Hover over any custom snippet to reveal the **edit (✏️)** and **delete (🗑️)** buttons
- Hover over a custom category to reveal the **delete** button

---

## Extension Settings

Custom snippets and categories are stored under:

```json
"devsnip.customCategories": []
```

You can also edit this directly in your `settings.json` if you prefer.

---

## Installation from Source

```bash
# 1. Clone or unzip the project folder
cd devsnip

# 2. Install dependencies
npm install

# 3. Open in VS Code and press F5 to launch the Extension Development Host
code .
```

### Build a `.vsix` package for permanent install:

```bash
npm install -g @vscode/vsce
vsce package
# → installs via: Extensions → ··· → Install from VSIX
```

---

## Architecture

DevSnip consists of:

- **TreeDataProvider** — drives the sidebar list with categories and items
- **Snippet Registry** — built-in command definitions (`snippets.ts`)
- **Custom Storage Layer** — reads/writes to VS Code global configuration
- **Command Handler** — clipboard, terminal, add/edit/delete operations

---

## Known Limitations

- Built-in snippets cannot be edited or removed (by design)
- No search/filter across snippets yet (planned)
- No import/export of custom snippet libraries yet (planned)

---

## Contributing

Contributions are welcome. Please open an issue before submitting large feature changes.

---

## License

MIT

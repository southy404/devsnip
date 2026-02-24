import * as vscode from "vscode";
import { DevSnipProvider, SnippetItem } from "./provider";
import { Category, Snippet } from "./snippets";

export function activate(context: vscode.ExtensionContext) {
  const provider = new DevSnipProvider();

  const treeView = vscode.window.createTreeView("devsnipView", {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  // ──────────────────────────────────────────────
  // Copy to clipboard
  // VS Code passes the TreeItem object when clicking the label,
  // but passes (code, label) strings when called from inline button.
  // We handle both cases.
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devsnip.copySnippet",
      async (codeOrItem: any, label?: string) => {
        let code: string | undefined;
        let displayLabel: string | undefined;

        if (typeof codeOrItem === "string") {
          // Called from inline context button: (code, label)
          code = codeOrItem;
          displayLabel = label;
        } else if (codeOrItem && typeof codeOrItem === "object") {
          // Called from label click: VS Code passes the TreeItem
          // Try all possible locations VS Code might put the data
          code = codeOrItem?.snippet?.code
            ?? codeOrItem?.command?.arguments?.[0]
            ?? undefined;
          displayLabel = codeOrItem?.snippet?.label
            ?? codeOrItem?.command?.arguments?.[1]
            ?? undefined;
        }

        if (!code) {
          vscode.window.showErrorMessage("DevSnip: Could not read snippet code.");
          return;
        }

        await vscode.env.clipboard.writeText(code);
        vscode.window.setStatusBarMessage(`$(check) Copied: ${displayLabel ?? code}`, 3000);
      }
    )
  );

  // ──────────────────────────────────────────────
  // Insert into active terminal
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devsnip.insertSnippet",
      async (item: any) => {
        const code = item?.snippet?.code
          ?? item?.command?.arguments?.[0]
          ?? undefined;

        if (!code) {
          vscode.window.showErrorMessage("DevSnip: Could not read snippet code.");
          return;
        }

        let terminal = vscode.window.activeTerminal;
        if (!terminal) {
          terminal = vscode.window.createTerminal("DevSnip");
        }
        terminal.show(true);
        terminal.sendText(code, false);
        vscode.window.setStatusBarMessage(`$(terminal) Inserted into terminal`, 2000);
      }
    )
  );

  // ──────────────────────────────────────────────
  // Refresh
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand("devsnip.refresh", () => provider.refresh())
  );

  // ──────────────────────────────────────────────
  // Add custom category
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand("devsnip.addCustomCategory", async () => {
      const name = await vscode.window.showInputBox({
        prompt: "Category name (e.g. Python, Kubernetes, My Scripts)",
        placeHolder: "My Category",
        validateInput: (v) => (v.trim() ? null : "Name required"),
      });
      if (!name) { return; }

      const cats = provider.getCustomCategories();
      const newCat: Category = {
        id: `custom_${Date.now()}`,
        label: name.trim(),
        icon: "$(bookmark)",
        snippets: [],
        isCustom: true,
      };
      cats.push(newCat);
      await provider.saveCustomCategories(cats);
      vscode.window.showInformationMessage(`Category "${name}" created!`);
    })
  );

  // ──────────────────────────────────────────────
  // Add custom snippet
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devsnip.addCustomSnippet",
      async (item?: SnippetItem) => {
        let targetCatId = item?.categoryId;

        if (!targetCatId) {
          const cats = provider.getCustomCategories();
          if (cats.length === 0) {
            const create = await vscode.window.showInformationMessage(
              "No custom categories yet. Create one first?",
              "Create Category", "Cancel"
            );
            if (create === "Create Category") {
              vscode.commands.executeCommand("devsnip.addCustomCategory");
            }
            return;
          }
          const picked = await vscode.window.showQuickPick(
            cats.map((c) => ({ label: c.label, id: c.id })),
            { placeHolder: "Choose a category" }
          );
          if (!picked) { return; }
          targetCatId = picked.id;
        }

        const label = await vscode.window.showInputBox({
          prompt: "Snippet name",
          placeHolder: "deploy production",
          validateInput: (v) => (v.trim() ? null : "Name required"),
        });
        if (!label) { return; }

        const code = await vscode.window.showInputBox({
          prompt: "Command / code to copy",
          placeHolder: "kubectl apply -f k8s/",
          validateInput: (v) => (v.trim() ? null : "Code required"),
        });
        if (!code) { return; }

        const description = await vscode.window.showInputBox({
          prompt: "Short description (optional)",
          placeHolder: "Deploy to production cluster",
        });

        const cats = provider.getCustomCategories();
        const cat = cats.find((c) => c.id === targetCatId);
        if (!cat) { return; }

        cat.snippets.push({
          label: label.trim(),
          code: code.trim(),
          description: description?.trim() ?? "",
        });
        await provider.saveCustomCategories(cats);
        vscode.window.showInformationMessage(`Snippet "${label}" added!`);
      }
    )
  );

  // ──────────────────────────────────────────────
  // Edit custom snippet
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devsnip.editCustomSnippet",
      async (item?: SnippetItem) => {
        if (!item?.snippet || !item.categoryId || item.snippetIndex === undefined) { return; }

        const label = await vscode.window.showInputBox({
          prompt: "Snippet name",
          value: item.snippet.label,
          validateInput: (v) => (v.trim() ? null : "Name required"),
        });
        if (label === undefined) { return; }

        const code = await vscode.window.showInputBox({
          prompt: "Command / code",
          value: item.snippet.code,
          validateInput: (v) => (v.trim() ? null : "Code required"),
        });
        if (code === undefined) { return; }

        const description = await vscode.window.showInputBox({
          prompt: "Description (optional)",
          value: item.snippet.description ?? "",
        });

        const cats = provider.getCustomCategories();
        const cat = cats.find((c) => c.id === item.categoryId);
        if (!cat || item.snippetIndex >= cat.snippets.length) { return; }

        cat.snippets[item.snippetIndex] = {
          label: label.trim(),
          code: code.trim(),
          description: description?.trim() ?? "",
        };
        await provider.saveCustomCategories(cats);
      }
    )
  );

  // ──────────────────────────────────────────────
  // Delete custom snippet or category
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devsnip.deleteCustomSnippet",
      async (item?: SnippetItem) => {
        if (!item) { return; }
        const cats = provider.getCustomCategories();

        if (!item.snippet) {
          const confirm = await vscode.window.showWarningMessage(
            `Delete category and all its snippets?`,
            { modal: true }, "Delete"
          );
          if (confirm !== "Delete") { return; }
          await provider.saveCustomCategories(cats.filter((c) => c.id !== item.categoryId));
          return;
        }

        const cat = cats.find((c) => c.id === item.categoryId);
        if (!cat || item.snippetIndex === undefined) { return; }
        const confirm = await vscode.window.showWarningMessage(
          `Delete snippet "${item.snippet.label}"?`,
          { modal: true }, "Delete"
        );
        if (confirm !== "Delete") { return; }
        cat.snippets.splice(item.snippetIndex, 1);
        await provider.saveCustomCategories(cats);
      }
    )
  );

  context.subscriptions.push(treeView);
}

export function deactivate() {}

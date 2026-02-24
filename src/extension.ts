import * as vscode from "vscode";
import { DevSnipProvider, SnippetItem } from "./provider";
import { Category, Snippet } from "./snippets";

export function activate(context: vscode.ExtensionContext) {
  const provider = new DevSnipProvider();

  // Register the tree view
  const treeView = vscode.window.createTreeView("devsnipView", {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  // ──────────────────────────────────────────────
  // Copy to clipboard
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devsnip.copySnippet",
      async (code?: string, label?: string) => {
        if (!code) {
          return;
        }
        await vscode.env.clipboard.writeText(code);
        vscode.window.setStatusBarMessage(
          `$(check) Copied: ${label ?? code}`,
          3000
        );
      }
    )
  );

  // ──────────────────────────────────────────────
  // Insert into active terminal
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devsnip.insertSnippet",
      async (itemOrCode?: SnippetItem | string, label?: string) => {
        // Can be called with (SnippetItem) from context menu
        // or with (code, label) from inline button
        let code: string | undefined;
        if (typeof itemOrCode === "string") {
          code = itemOrCode;
        } else {
          code = itemOrCode?.snippet?.code;
        }
        if (!code) {
          return;
        }
        let terminal = vscode.window.activeTerminal;
        if (!terminal) {
          terminal = vscode.window.createTerminal("DevSnip");
        }
        terminal.show(true);
        terminal.sendText(code, false); // false = paste without executing
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
      if (!name) {
        return;
      }

      const cats = provider.getCustomCategories();
      const id = `custom_${Date.now()}`;
      const newCat: Category = {
        id,
        label: name.trim(),
        icon: "$(bookmark)",
        snippets: [],
        isCustom: true,
      };
      cats.push(newCat);
      await provider.saveCustomCategories(cats);
      vscode.window.showInformationMessage(
        `Category "${name}" created! Click the + icon to add snippets.`
      );
    })
  );

  // ──────────────────────────────────────────────
  // Add custom snippet
  // ──────────────────────────────────────────────
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "devsnip.addCustomSnippet",
      async (item?: SnippetItem) => {
        // Determine target category
        let targetCatId = item?.categoryId;

        if (!targetCatId) {
          const cats = provider.getCustomCategories();
          if (cats.length === 0) {
            const create = await vscode.window.showInformationMessage(
              "No custom categories yet. Create one first?",
              "Create Category",
              "Cancel"
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
          if (!picked) {
            return;
          }
          targetCatId = picked.id;
        }

        const label = await vscode.window.showInputBox({
          prompt: "Snippet name (short label)",
          placeHolder: "deploy production",
          validateInput: (v) => (v.trim() ? null : "Name required"),
        });
        if (!label) {
          return;
        }

        const code = await vscode.window.showInputBox({
          prompt: "Command / code to copy",
          placeHolder: "kubectl apply -f k8s/",
          validateInput: (v) => (v.trim() ? null : "Code required"),
        });
        if (!code) {
          return;
        }

        const description = await vscode.window.showInputBox({
          prompt: "Short description (optional)",
          placeHolder: "Deploy to production cluster",
        });

        const cats = provider.getCustomCategories();
        const cat = cats.find((c) => c.id === targetCatId);
        if (!cat) {
          return;
        }

        const newSnippet: Snippet = {
          label: label.trim(),
          code: code.trim(),
          description: description?.trim() ?? "",
        };
        cat.snippets.push(newSnippet);
        await provider.saveCustomCategories(cats);
        vscode.window.showInformationMessage(
          `Snippet "${label}" added to "${cat.label}"!`
        );
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
        if (!item?.snippet || !item.categoryId || item.snippetIndex === undefined) {
          return;
        }

        const label = await vscode.window.showInputBox({
          prompt: "Snippet name",
          value: item.snippet.label,
          validateInput: (v) => (v.trim() ? null : "Name required"),
        });
        if (label === undefined) {
          return;
        }

        const code = await vscode.window.showInputBox({
          prompt: "Command / code",
          value: item.snippet.code,
          validateInput: (v) => (v.trim() ? null : "Code required"),
        });
        if (code === undefined) {
          return;
        }

        const description = await vscode.window.showInputBox({
          prompt: "Description (optional)",
          value: item.snippet.description ?? "",
        });

        const cats = provider.getCustomCategories();
        const cat = cats.find((c) => c.id === item.categoryId);
        if (!cat || item.snippetIndex >= cat.snippets.length) {
          return;
        }

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
        if (!item) {
          return;
        }

        const cats = provider.getCustomCategories();

        // Deleting a category
        if (!item.snippet) {
          const confirm = await vscode.window.showWarningMessage(
            `Delete category "${item.label.replace(/^\$\(.*?\)\s*/, "")}" and all its snippets?`,
            { modal: true },
            "Delete"
          );
          if (confirm !== "Delete") {
            return;
          }
          const updated = cats.filter((c) => c.id !== item.categoryId);
          await provider.saveCustomCategories(updated);
          return;
        }

        // Deleting a snippet
        const cat = cats.find((c) => c.id === item.categoryId);
        if (!cat || item.snippetIndex === undefined) {
          return;
        }
        const confirm = await vscode.window.showWarningMessage(
          `Delete snippet "${item.snippet.label}"?`,
          { modal: true },
          "Delete"
        );
        if (confirm !== "Delete") {
          return;
        }
        cat.snippets.splice(item.snippetIndex, 1);
        await provider.saveCustomCategories(cats);
      }
    )
  );

  context.subscriptions.push(treeView);
}

export function deactivate() {}

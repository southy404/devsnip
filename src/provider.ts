import * as vscode from "vscode";
import { Category, Snippet, BUILTIN_CATEGORIES } from "./snippets";

export class SnippetItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly snippet?: Snippet,
    public readonly categoryId?: string,
    public readonly isCustom?: boolean,
    public readonly snippetIndex?: number
  ) {
    super(label, collapsibleState);

    if (snippet) {
      this.description = snippet.description ?? "";
      this.tooltip = new vscode.MarkdownString(
        `**${snippet.label}**\n\`\`\`\n${snippet.code}\n\`\`\``
      );
      // Both built-in and custom snippets copy on click
      this.contextValue = isCustom ? "customSnippet" : "snippet";
      this.command = {
        command: "devsnip.copySnippet",
        title: "Copy",
        arguments: [snippet.code, snippet.label],
      };
    } else {
      this.contextValue = isCustom ? "customCategory" : "category";
    }
  }
}

export class DevSnipProvider implements vscode.TreeDataProvider<SnippetItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SnippetItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: SnippetItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: SnippetItem): SnippetItem[] {
    if (!element) {
      // Root: show built-in categories + custom categories
      const builtinItems = BUILTIN_CATEGORIES.map(
        (cat) =>
          new SnippetItem(
            `${cat.icon}  ${cat.label}`,
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            cat.id,
            false
          )
      );

      const customCats = this.getCustomCategories();
      const customItems = customCats.map(
        (cat) =>
          new SnippetItem(
            `$(bookmark)  ${cat.label}`,
            vscode.TreeItemCollapsibleState.Collapsed,
            undefined,
            cat.id,
            true
          )
      );

      return [...builtinItems, ...customItems];
    }

    // Children of a category
    const catId = element.categoryId;
    if (!catId) {
      return [];
    }

    // Built-in?
    const builtin = BUILTIN_CATEGORIES.find((c) => c.id === catId);
    if (builtin) {
      return builtin.snippets.map(
        (s, i) =>
          new SnippetItem(
            s.label,
            vscode.TreeItemCollapsibleState.None,
            s,
            catId,
            false,
            i
          )
      );
    }

    // Custom
    const customCats = this.getCustomCategories();
    const custom = customCats.find((c) => c.id === catId);
    if (custom) {
      return custom.snippets.map(
        (s, i) =>
          new SnippetItem(
            s.label,
            vscode.TreeItemCollapsibleState.None,
            s,
            catId,
            true,
            i
          )
      );
    }

    return [];
  }

  getCustomCategories(): Category[] {
    const config = vscode.workspace.getConfiguration("devsnip");
    return config.get<Category[]>("customCategories") ?? [];
  }

  async saveCustomCategories(cats: Category[]): Promise<void> {
    await vscode.workspace
      .getConfiguration("devsnip")
      .update("customCategories", cats, vscode.ConfigurationTarget.Global);
    this.refresh();
  }
}

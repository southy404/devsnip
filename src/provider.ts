import * as vscode from "vscode";
import { Category, Snippet, BUILTIN_CATEGORIES } from "./snippets";

export class SnippetItem extends vscode.TreeItem {
  public readonly snippet?: Snippet;
  public readonly categoryId?: string;
  public readonly isCustom?: boolean;
  public readonly snippetIndex?: number;
  // Store code directly on the item so VS Code can serialize it
  public readonly snippetCode?: string;
  public readonly snippetLabel?: string;

  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    snippet?: Snippet,
    categoryId?: string,
    isCustom?: boolean,
    snippetIndex?: number
  ) {
    super(label, collapsibleState);

    this.snippet = snippet;
    this.categoryId = categoryId;
    this.isCustom = isCustom;
    this.snippetIndex = snippetIndex;
    this.snippetCode = snippet?.code;
    this.snippetLabel = snippet?.label;

    if (snippet) {
      this.description = snippet.description ?? "";
      this.tooltip = new vscode.MarkdownString(
        `**${snippet.label}**\n\`\`\`\n${snippet.code}\n\`\`\``
      );
      this.contextValue = isCustom ? "customSnippet" : "snippet";
      // Pass the code and label as plain primitive strings
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
      const builtinItems = BUILTIN_CATEGORIES.map(
        (cat) => new SnippetItem(
          `${cat.icon}  ${cat.label}`,
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined, cat.id, false
        )
      );
      const customCats = this.getCustomCategories();
      const customItems = customCats.map(
        (cat) => new SnippetItem(
          `$(bookmark)  ${cat.label}`,
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined, cat.id, true
        )
      );
      return [...builtinItems, ...customItems];
    }

    const catId = element.categoryId;
    if (!catId) { return []; }

    const builtin = BUILTIN_CATEGORIES.find((c) => c.id === catId);
    if (builtin) {
      return builtin.snippets.map(
        (s, i) => new SnippetItem(s.label, vscode.TreeItemCollapsibleState.None, s, catId, false, i)
      );
    }

    const customCats = this.getCustomCategories();
    const custom = customCats.find((c) => c.id === catId);
    if (custom) {
      return custom.snippets.map(
        (s, i) => new SnippetItem(s.label, vscode.TreeItemCollapsibleState.None, s, catId, true, i)
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

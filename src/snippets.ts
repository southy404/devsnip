export interface Snippet {
  label: string;
  code: string;
  description?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  snippets: Snippet[];
  isCustom?: boolean;
}

export const BUILTIN_CATEGORIES: Category[] = [
  {
    id: "git",
    label: "Git",
    icon: "$(source-control)",
    snippets: [
      { label: "git status", code: "git status", description: "Show working tree status" },
      { label: "git init", code: "git init", description: "Initialize a repository" },
      { label: "git clone", code: "git clone <url>", description: "Clone a repository" },
      { label: "git add all", code: "git add .", description: "Stage all changes" },
      { label: "git commit", code: 'git commit -m "feat: "', description: "Commit with message" },
      { label: "git commit amend", code: "git commit --amend --no-edit", description: "Amend last commit" },
      { label: "git push", code: "git push origin main", description: "Push to remote" },
      { label: "git push force", code: "git push --force-with-lease", description: "Safe force push" },
      { label: "git pull", code: "git pull origin main", description: "Pull from remote" },
      { label: "git pull rebase", code: "git pull --rebase", description: "Pull with rebase" },
      { label: "git fetch all", code: "git fetch --all", description: "Fetch all remotes" },
      { label: "git branch list", code: "git branch -a", description: "List all branches" },
      { label: "git branch new", code: "git checkout -b feature/", description: "Create & switch branch" },
      { label: "git checkout", code: "git checkout main", description: "Switch to main" },
      { label: "git merge", code: "git merge --no-ff feature/", description: "Merge branch" },
      { label: "git rebase", code: "git rebase main", description: "Rebase onto main" },
      { label: "git stash", code: "git stash push -m 'wip'", description: "Stash changes" },
      { label: "git stash pop", code: "git stash pop", description: "Apply last stash" },
      { label: "git stash list", code: "git stash list", description: "List stashes" },
      { label: "git log", code: "git log --oneline --graph --all", description: "Pretty log" },
      { label: "git log last 5", code: "git log --oneline -5", description: "Last 5 commits" },
      { label: "git diff", code: "git diff HEAD", description: "Show all changes" },
      { label: "git diff staged", code: "git diff --cached", description: "Show staged changes" },
      { label: "git reset soft", code: "git reset --soft HEAD~1", description: "Undo last commit, keep changes" },
      { label: "git reset hard", code: "git reset --hard HEAD", description: "Discard all changes" },
      { label: "git reset file", code: "git checkout -- <file>", description: "Restore file" },
      { label: "git remote -v", code: "git remote -v", description: "List remotes" },
      { label: "git remote add", code: "git remote add origin <url>", description: "Add remote" },
      { label: "git tag", code: 'git tag -a v1.0.0 -m "Release v1.0.0"', description: "Create annotated tag" },
      { label: "git push tags", code: "git push origin --tags", description: "Push all tags" },
      { label: "git cherry-pick", code: "git cherry-pick <commit-hash>", description: "Cherry-pick commit" },
      { label: "git bisect start", code: "git bisect start", description: "Start bisect" },
      { label: "git clean", code: "git clean -fd", description: "Remove untracked files" },
      { label: "git submodule update", code: "git submodule update --init --recursive", description: "Update submodules" }
    ]
  },
  {
    id: "npm",
    label: "npm",
    icon: "$(package)",
    snippets: [
      { label: "npm init", code: "npm init -y", description: "Init with defaults" },
      { label: "npm install", code: "npm install", description: "Install dependencies" },
      { label: "npm install pkg", code: "npm install <package>", description: "Install a package" },
      { label: "npm install dev", code: "npm install -D <package>", description: "Install as devDependency" },
      { label: "npm install global", code: "npm install -g <package>", description: "Install globally" },
      { label: "npm uninstall", code: "npm uninstall <package>", description: "Remove a package" },
      { label: "npm run", code: "npm run <script>", description: "Run a script" },
      { label: "npm run dev", code: "npm run dev", description: "Start dev server" },
      { label: "npm run build", code: "npm run build", description: "Build project" },
      { label: "npm run test", code: "npm test", description: "Run tests" },
      { label: "npm run lint", code: "npm run lint", description: "Run linter" },
      { label: "npm outdated", code: "npm outdated", description: "Check outdated packages" },
      { label: "npm update", code: "npm update", description: "Update packages" },
      { label: "npm audit", code: "npm audit", description: "Security audit" },
      { label: "npm audit fix", code: "npm audit fix", description: "Fix vulnerabilities" },
      { label: "npm list", code: "npm ls --depth=0", description: "List top-level packages" },
      { label: "npm publish", code: "npm publish --access public", description: "Publish package" },
      { label: "npm version patch", code: "npm version patch", description: "Bump patch version" },
      { label: "npm version minor", code: "npm version minor", description: "Bump minor version" },
      { label: "npm cache clean", code: "npm cache clean --force", description: "Clear cache" },
      { label: "npx create-react-app", code: "npx create-react-app my-app", description: "Create React app" },
      { label: "npx create-next-app", code: "npx create-next-app@latest my-app", description: "Create Next.js app" },
      { label: "npx create-vite", code: "npm create vite@latest my-app", description: "Create Vite app" }
    ]
  },
  {
    id: "docker",
    label: "Docker",
    icon: "$(server)",
    snippets: [
      { label: "docker build", code: "docker build -t myapp:latest .", description: "Build image" },
      { label: "docker run", code: "docker run -d -p 3000:3000 --name myapp myapp:latest", description: "Run container" },
      { label: "docker run interactive", code: "docker run -it myapp:latest /bin/sh", description: "Run interactively" },
      { label: "docker ps", code: "docker ps -a", description: "List all containers" },
      { label: "docker stop", code: "docker stop myapp", description: "Stop container" },
      { label: "docker rm", code: "docker rm myapp", description: "Remove container" },
      { label: "docker images", code: "docker images", description: "List images" },
      { label: "docker rmi", code: "docker rmi myapp:latest", description: "Remove image" },
      { label: "docker logs", code: "docker logs -f myapp", description: "Follow logs" },
      { label: "docker exec", code: "docker exec -it myapp /bin/sh", description: "Shell into container" },
      { label: "docker compose up", code: "docker compose up -d --build", description: "Start compose" },
      { label: "docker compose down", code: "docker compose down", description: "Stop compose" },
      { label: "docker compose logs", code: "docker compose logs -f", description: "Compose logs" },
      { label: "docker system prune", code: "docker system prune -af", description: "Remove all unused" },
      { label: "docker pull", code: "docker pull <image>:latest", description: "Pull image" },
      { label: "docker push", code: "docker push <image>:latest", description: "Push image" }
    ]
  },
  {
    id: "unix",
    label: "Linux / Shell",
    icon: "$(terminal)",
    snippets: [
      { label: "find file", code: "find . -name '*.ts' -type f", description: "Find files by name" },
      { label: "find in files", code: "grep -r 'search_term' . --include='*.ts'", description: "Search text in files" },
      { label: "kill port", code: "lsof -ti:<PORT> | xargs kill -9", description: "Kill process on port" },
      { label: "list sorted size", code: "du -sh * | sort -rh | head -20", description: "Folder sizes sorted" },
      { label: "watch file changes", code: "watch -n 2 ls -la", description: "Watch directory every 2s" },
      { label: "tar create", code: "tar -czf archive.tar.gz ./folder", description: "Create tar.gz" },
      { label: "tar extract", code: "tar -xzf archive.tar.gz", description: "Extract tar.gz" },
      { label: "chmod +x", code: "chmod +x script.sh", description: "Make file executable" },
      { label: "copy dir", code: "cp -r source/ destination/", description: "Copy directory" },
      { label: "disk usage", code: "df -h", description: "Show disk usage" },
      { label: "memory usage", code: "free -h", description: "Show memory usage" },
      { label: "top processes", code: "htop", description: "Interactive process viewer" },
      { label: "symlink", code: "ln -s /source /link", description: "Create symlink" },
      { label: "tail log", code: "tail -f /var/log/syslog", description: "Follow log file" },
      { label: "ssh", code: "ssh user@hostname", description: "Connect via SSH" },
      { label: "scp upload", code: "scp ./file user@host:/path/", description: "Copy file to remote" },
      { label: "env vars", code: "printenv | grep -i 'MY_'", description: "Print env variables" },
      { label: "curl GET", code: "curl -s https://api.example.com/endpoint | jq .", description: "GET with pretty JSON" },
      { label: "curl POST", code: "curl -X POST -H 'Content-Type: application/json' -d '{\"key\":\"val\"}' https://api.example.com/endpoint", description: "POST JSON" }
    ]
  },
  {
    id: "vscode",
    label: "VS Code",
    icon: "$(code)",
    snippets: [
      { label: "open settings json", code: "code ~/.config/Code/User/settings.json", description: "Open settings file" },
      { label: "install extension", code: "code --install-extension <ext-id>", description: "Install extension via CLI" },
      { label: "list extensions", code: "code --list-extensions", description: "List installed extensions" },
      { label: "disable extensions", code: "code --disable-extensions", description: "Start without extensions" },
      { label: "open folder", code: "code .", description: "Open current folder in VS Code" }
    ]
  }
];

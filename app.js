/**
 * Agent Hub landing page — deeplinks, copy buttons, agent modals, tabs
 */

(function () {
  "use strict";

  const CATALOG_REPO = "https://github.com/BeeNeural-com/agenthub";
  const SERVER_NAME = "agenthub";
  /** Relative to the open workspace — Cursor resolves cwd as the project root for project MCP. */
  const WORKSPACE_CATALOG = ".agenthub";
  const FULL_BUNDLE_PRESET =
    "document-processing,product-management,devops-sre,software-engineering-general,web-development,ai-operations,data-analytics,security,marketing,sales,customer-success,finance,human-resources,operations,program-management,legal-compliance,strategy-executive,communications,procurement-supply-chain,r-and-d,sw-engineering-ai-augmented";

  const REPO_BASE = detectRepoBase();

  const AGENTS = {
    cursor: {
      name: "Cursor",
      path: ".cursor/mcp.json",
      pathNote: "Project MCP config",
      outputFlag: ".cursor/mcp.json",
      wrap: false,
      deeplink: "cursor",
    },
    vscode: {
      name: "VS Code (Copilot)",
      path: ".vscode/mcp.json",
      pathNote: "Workspace-level MCP config",
      outputFlag: ".vscode/mcp.json",
      wrap: false,
      deeplink: "vscode",
    },
    claude: {
      name: "Claude Desktop",
      pathWin: "%APPDATA%\\Claude\\claude_desktop_config.json",
      pathMac: "~/Library/Application Support/Claude/claude_desktop_config.json",
      pathLinux: "~/.config/Claude/claude_desktop_config.json",
      pathNote: "Global config — restart Claude Desktop after saving",
      wrap: true,
      deeplink: null,
    },
    windsurf: {
      name: "Windsurf",
      pathWin: "%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json",
      pathMac: "~/.codeium/windsurf/mcp_config.json",
      pathLinux: "~/.codeium/windsurf/mcp_config.json",
      pathNote: "Global config — Refresh in Cascade MCP toolbar after saving",
      wrap: true,
      deeplink: null,
    },
    cline: {
      name: "Cline",
      pathWin:
        "%APPDATA%\\Code\\User\\globalStorage\\saoudrizwan.claude-dev\\settings\\cline_mcp_settings.json",
      pathMac:
        "~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
      pathLinux:
        "~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json",
      pathNote: "Open via Cline sidebar → MCP Servers → Configure MCP Servers",
      wrap: true,
      deeplink: null,
    },
  };

  const BUNDLES = [
    { id: "ai-operations", name: "AI Operations", skills: 5, desc: "Prompt engineering, RAG, LLM risk, multi-agent workflows" },
    { id: "communications", name: "Communications", skills: 1, desc: "Internal org announcements and change messaging" },
    { id: "customer-success", name: "Customer Success", skills: 5, desc: "Support triage, KB articles, QBR, churn analysis" },
    { id: "data-analytics", name: "Data Analytics", skills: 5, desc: "SQL, EDA, dashboards, KPI definition" },
    { id: "devops-sre", name: "DevOps & SRE", skills: 7, desc: "CI/CD, deployments, incidents, SLOs, monitoring" },
    { id: "document-processing", name: "Document Processing", skills: 4, desc: "DOCX, XLSX, PPTX, PDF authoring and extraction" },
    { id: "finance", name: "Finance", skills: 4, desc: "Budgeting, forecasting, variance, unit economics" },
    { id: "human-resources", name: "Human Resources", skills: 4, desc: "Job descriptions, interviews, onboarding" },
    { id: "legal-compliance", name: "Legal & Compliance", skills: 2, desc: "Contract checklists and NDA triage" },
    { id: "marketing", name: "Marketing", skills: 6, desc: "Campaigns, SEO, content, email, landing pages" },
    { id: "operations", name: "Operations", skills: 4, desc: "SOPs, process optimization, business cases, status reports" },
    { id: "procurement-supply-chain", name: "Procurement & Supply Chain", skills: 2, desc: "RFP drafting and vendor evaluation" },
    { id: "product-management", name: "Product Management", skills: 7, desc: "Discovery, PRDs, roadmaps, prioritization, sprint planning" },
    { id: "program-management", name: "Program Management", skills: 3, desc: "RAID logs, stakeholder analysis, program status" },
    { id: "r-and-d", name: "R&D", skills: 13, desc: "Research, feasibility, experimentation, IP, engineering handoff" },
    { id: "sales", name: "Sales", skills: 6, desc: "Discovery, outreach, battlecards, lead qualification" },
    { id: "security", name: "Security", skills: 4, desc: "Threat modeling, OWASP review, vulnerability triage" },
    { id: "software-engineering-general", name: "Software Engineering", skills: 8, desc: "Language-agnostic TDD, architecture, API design, RFCs" },
    { id: "strategy-executive", name: "Strategy & Executive", skills: 3, desc: "Strategic planning, SWOT, competitive landscape" },
    { id: "sw-engineering-ai-augmented", name: "SW Engineering (AI Augmented)", skills: 32, desc: "ASPICE-aligned automotive C++ software engineering" },
    { id: "web-development", name: "Web Development", skills: 16, desc: "Full-stack web: Node, React, Next, Vue, Angular, UI/UX" },
  ];

  function detectRepoBase() {
    const host = location.hostname;
    const parts = location.pathname.split("/").filter(Boolean);
    if (host.endsWith("github.io") && parts.length >= 1) {
      const owner = host.replace(".github.io", "");
      return `https://github.com/${owner}/${parts[0]}`;
    }
    return CATALOG_REPO;
  }

  function isWindowsUa() {
    return navigator.userAgent.toLowerCase().includes("win");
  }

  function agentPath(agent) {
    if (agent.path) return agent.path;
    if (isWindowsUa()) return agent.pathWin;
    if (navigator.userAgent.toLowerCase().includes("mac")) return agent.pathMac;
    return agent.pathLinux;
  }

  function catalogPathForDisplay() {
    return WORKSPACE_CATALOG;
  }

  function pythonMcpCommand() {
    if (isWindowsUa()) {
      return "%USERPROFILE%/agenthub-venv/Scripts/agenthub-mcp.exe";
    }
    return "agenthub-mcp";
  }

  /** Stdio server entry for mcp.json (no name wrapper). */
  function mcpServerEntry(runtime) {
    const catalog = catalogPathForDisplay();
    if (runtime === "noclone" || runtime === "private" || runtime === "python") {
      return {
        type: "stdio",
        command: pythonMcpCommand(),
        args: ["--stdio"],
        env: {
          AGENTHUB_CATALOG_PATH: catalog,
          AGENTHUB_BUNDLE: FULL_BUNDLE_PRESET,
          AGENTHUB_TOOL_DESC_MODE: "active",
        },
      };
    }
    if (runtime === "npm") {
      return {
        type: "stdio",
        command: "npx",
        args: ["-y", "@agenthub-mcp/mcp", "--stdio"],
        env: {
          AGENTHUB_CATALOG_PATH: catalog,
        },
      };
    }
    if (runtime === "dev") {
      return {
        type: "stdio",
        command: "${workspaceFolder}/.venv/Scripts/agenthub-mcp.exe",
        args: ["--stdio"],
        env: {
          AGENTHUB_CATALOG_PATH: "${workspaceFolder}/.agenthub",
          AGENTHUB_BUNDLE: FULL_BUNDLE_PRESET,
          AGENTHUB_TOOL_DESC_MODE: "active",
        },
      };
    }
    return {
      type: "stdio",
      command: pythonMcpCommand(),
      args: ["--stdio"],
      env: {
        AGENTHUB_CATALOG_PATH: catalog,
        AGENTHUB_BUNDLE: FULL_BUNDLE_PRESET,
      },
    };
  }

  function buildMcpConfig(runtime, wrap) {
    const entry = mcpServerEntry(runtime);
    const fragment = { mcpServers: { agenthub: entry } };
    return JSON.stringify(fragment, null, 2);
  }

  function toBase64Utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary);
  }

  /**
   * Official Cursor MCP install deeplink:
   * cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_CONFIG
   * config = JSON.stringify(serverConfig) then base64 (no mcpServers wrapper).
   */
  function cursorInstallUrl(runtime) {
    const config = mcpServerEntry(runtime || "npm");
    const encoded = encodeURIComponent(toBase64Utf8(JSON.stringify(config)));
    return (
      "cursor://anysphere.cursor-deeplink/mcp/install" +
      `?name=${encodeURIComponent(SERVER_NAME)}&config=${encoded}`
    );
  }

  /**
   * VS Code MCP install deeplink:
   * vscode:mcp/install?${encodeURIComponent(JSON.stringify({ name, ...config }))}
   */
  function vscodeInstallUrl(runtime) {
    const payload = Object.assign({ name: SERVER_NAME }, mcpServerEntry(runtime || "npm"));
    return `vscode:mcp/install?${encodeURIComponent(JSON.stringify(payload))}`;
  }

  function bootstrapOneLiner() {
    const src = CATALOG_REPO;
    const gitAh =
      'git+https://github.com/BeeNeural-com/agenthub.git@main#subdirectory=packages/python/agenthub';
    if (isWindowsUa()) {
      return [
        `pip install "agenthub @ ${gitAh}"`,
        `agenthub install --full --target .\\.agenthub --source ${src}`,
        "agenthub connect --catalog .\\.agenthub --output .\\.cursor\\mcp.json --runtime npm",
      ].join("; ");
    }
    return [
      `pip install "agenthub @ ${gitAh}"`,
      `agenthub install --full --target ./.agenthub --source ${src}`,
      "agenthub connect --catalog ./.agenthub --output ./.cursor/mcp.json --runtime npm",
    ].join(" && ");
  }

  function bootstrapScriptHint() {
    if (isWindowsUa()) {
      return ".\\install-agenthub-mcp.ps1";
    }
    return "agenthub install --full --target ./.agenthub --source " + CATALOG_REPO;
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(
      () => {
        if (!btn) return;
        const label = btn.textContent;
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = label;
          btn.classList.remove("copied");
        }, 1800);
      },
      () => {
        if (btn) btn.textContent = "Copy failed";
      }
    );
  }

  function initCopyButtons() {
    document.querySelectorAll(".code-block").forEach((block) => {
      const pre = block.querySelector("pre");
      if (!pre) return;
      if (block.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", () => copyText(pre.textContent, btn));
      block.appendChild(btn);
    });
  }

  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => nav.classList.remove("open"));
    });
  }

  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((root) => {
      const buttons = root.querySelectorAll(".tab-btn");
      const panels = root.querySelectorAll(".tab-panel");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.tab;
          buttons.forEach((b) => b.classList.toggle("active", b === btn));
          panels.forEach((p) => p.classList.toggle("active", p.id === id));
        });
      });
    });
  }

  function wireDeeplink(el, url) {
    if (!el) return;
    el.href = url;
    el.hidden = false;
  }

  function openAgentModal(agentId) {
    const agent = AGENTS[agentId];
    if (!agent) return;
    const overlay = document.getElementById("agent-modal");
    const title = document.getElementById("modal-title");
    const pathEl = document.getElementById("modal-path");
    const configPre = document.getElementById("modal-config");
    const connectCmd = document.getElementById("modal-connect-cmd");
    const stepsEl = document.getElementById("modal-steps");
    const deeplinkBtn = document.getElementById("modal-deeplink");
    const bootstrapPre = document.getElementById("modal-bootstrap");

    title.textContent = `Connect ${agent.name}`;
    pathEl.textContent = agentPath(agent) + (agent.pathNote ? ` — ${agent.pathNote}` : "");

    const config = buildMcpConfig("npm", agent.wrap);
    configPre.textContent = config;

    if (bootstrapPre) {
      bootstrapPre.textContent = bootstrapOneLiner();
    }

    if (stepsEl) {
      if (agent.deeplink === "cursor") {
        stepsEl.innerHTML = [
          "<li>Run the project one-liner below to install the catalog and write <code>.cursor/mcp.json</code>.</li>",
          "<li>Or click <strong>Add to Cursor</strong> to open the MCP install prompt.</li>",
          "<li>Restart Cursor when the catalog is ready.</li>",
        ].join("");
      } else if (agent.deeplink === "vscode") {
        stepsEl.innerHTML = [
          "<li>Run the project one-liner so <code>.agenthub</code> is in place.</li>",
          "<li>Click <strong>Add to VS Code</strong>, or paste the JSON into <code>.vscode/mcp.json</code>.</li>",
          "<li>Reload the window if MCP tools do not appear.</li>",
        ].join("");
      } else {
        stepsEl.innerHTML = [
          "<li>Run the project one-liner from your workspace root.</li>",
          `<li>Copy the JSON into <code>${agentPath(agent)}</code>.</li>`,
          "<li>Restart the app and refresh MCP servers.</li>",
        ].join("");
      }
    }

    const connectBlock = connectCmd.closest(".connect-cmd-block");
    const copyConnectBtn = document.getElementById("modal-copy-connect");
    if (agent.outputFlag) {
      connectCmd.textContent = `agenthub connect --catalog .agenthub --output ${agent.outputFlag} --runtime npm`;
      connectBlock.hidden = false;
      copyConnectBtn.hidden = false;
    } else {
      connectBlock.hidden = true;
      copyConnectBtn.hidden = true;
    }

    if (deeplinkBtn) {
      if (agent.deeplink === "cursor") {
        deeplinkBtn.textContent = "Add to Cursor";
        wireDeeplink(deeplinkBtn, cursorInstallUrl("npm"));
      } else if (agent.deeplink === "vscode") {
        deeplinkBtn.textContent = "Add to VS Code";
        wireDeeplink(deeplinkBtn, vscodeInstallUrl("npm"));
      } else {
        deeplinkBtn.hidden = true;
        deeplinkBtn.removeAttribute("href");
      }
    }

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const overlay = document.getElementById("agent-modal");
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function initAgentCards() {
    document.querySelectorAll("[data-agent]").forEach((card) => {
      card.addEventListener("click", () => openAgentModal(card.dataset.agent));
    });

    const overlay = document.getElementById("agent-modal");
    overlay.querySelector(".modal-close").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    document.getElementById("modal-copy-config").addEventListener("click", (e) => {
      copyText(document.getElementById("modal-config").textContent, e.currentTarget);
    });
    document.getElementById("modal-copy-connect").addEventListener("click", (e) => {
      copyText(document.getElementById("modal-connect-cmd").textContent, e.currentTarget);
    });
    const copyBoot = document.getElementById("modal-copy-bootstrap");
    if (copyBoot) {
      copyBoot.addEventListener("click", (e) => {
        copyText(document.getElementById("modal-bootstrap").textContent, e.currentTarget);
      });
    }
  }

  function initDeeplinkCtas() {
    const cursorUrl = cursorInstallUrl("npm");
    const vscodeUrl = vscodeInstallUrl("npm");

    document.querySelectorAll("[data-cursor-install]").forEach((el) => {
      wireDeeplink(el, cursorUrl);
    });
    document.querySelectorAll("[data-vscode-install]").forEach((el) => {
      wireDeeplink(el, vscodeUrl);
    });

    const bootPre = document.getElementById("bootstrap-oneliner");
    if (bootPre) bootPre.textContent = bootstrapOneLiner();

    const bootHint = document.getElementById("bootstrap-script-hint");
    if (bootHint) bootHint.textContent = bootstrapScriptHint();

    const copyBoot = document.getElementById("copy-bootstrap");
    if (copyBoot && bootPre) {
      copyBoot.addEventListener("click", (e) => copyText(bootPre.textContent, e.currentTarget));
    }
  }

  function renderBundles() {
    const grid = document.getElementById("bundles-grid");
    if (!grid) return;
    grid.innerHTML = BUNDLES.map(
      (b) => `
      <article class="bundle-card">
        <div class="bundle-id">${b.id}</div>
        <div class="bundle-meta">
          <h3>${b.name}</h3>
          <span class="bundle-count">${b.skills} skills</span>
        </div>
        <p class="bundle-desc">${b.desc}</p>
      </article>`
    ).join("");
  }

  function initDocLinks() {
    document.querySelectorAll("[data-doc]").forEach((el) => {
      const doc = el.dataset.doc;
      el.href = REPO_BASE ? `${REPO_BASE}/blob/main/${doc}` : "#docs";
    });
    const repoLink = document.getElementById("repo-link");
    if (repoLink) {
      if (REPO_BASE) {
        repoLink.href = REPO_BASE;
        repoLink.hidden = false;
      } else {
        repoLink.hidden = true;
      }
    }
  }

  function initSetupTabsContent() {
    const pythonPre = document.getElementById("config-python");
    const npmPre = document.getElementById("config-npm");
    const devPre = document.getElementById("config-dev");
    if (pythonPre) pythonPre.textContent = buildMcpConfig("python", false);
    if (npmPre) npmPre.textContent = buildMcpConfig("npm", false);
    if (devPre) devPre.textContent = buildMcpConfig("dev", false);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCopyButtons();
    initNav();
    initTabs();
    initAgentCards();
    initDeeplinkCtas();
    renderBundles();
    initDocLinks();
    initSetupTabsContent();
  });
})();

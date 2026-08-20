/**
 * Agent Hub landing page — copy buttons, agent modals, tabs
 */

(function () {
  "use strict";

  const PRIVATE_MCP_REPO = "https://github.com/BeeNeural-com/agenthub";
  const FULL_BUNDLE_PRESET =
    "document-processing,product-management,devops-sre,software-engineering-general,web-development,ai-operations,data-analytics,security,marketing,sales,customer-success,finance,human-resources,operations,program-management,legal-compliance,strategy-executive,communications,procurement-supply-chain,r-and-d,sw-engineering-ai-augmented";

  const REPO_BASE = detectRepoBase();

  const AGENTS = {
    cursor: {
      name: "Cursor",
      path: ".cursor/mcp.json",
      pathNote: "Project-level config in your workspace root",
      outputFlag: ".cursor/mcp.json",
      wrap: false,
    },
    vscode: {
      name: "VS Code (Copilot)",
      path: ".vscode/mcp.json",
      pathNote: "Workspace-level MCP config",
      outputFlag: ".vscode/mcp.json",
      wrap: false,
    },
    claude: {
      name: "Claude Desktop",
      pathWin: "%APPDATA%\\Claude\\claude_desktop_config.json",
      pathMac: "~/Library/Application Support/Claude/claude_desktop_config.json",
      pathLinux: "~/.config/Claude/claude_desktop_config.json",
      pathNote: "Global config — restart Claude Desktop after saving",
      wrap: true,
    },
    windsurf: {
      name: "Windsurf",
      pathWin: "%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json",
      pathMac: "~/.codeium/windsurf/mcp_config.json",
      pathLinux: "~/.codeium/windsurf/mcp_config.json",
      pathNote: "Global config — click Refresh in Cascade MCP toolbar after saving",
      wrap: true,
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
    // Public Pages / local preview: marketing site; MCP packages live on private BeeNeural repo
    return PRIVATE_MCP_REPO;
  }

  function defaultCatalogPath() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) return "C:\\Users\\YOUR_USER\\.agenthub";
    return "/home/YOUR_USER/.agenthub";
  }

  function agentPath(agent) {
    if (agent.path) return agent.path;
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) return agent.pathWin;
    if (ua.includes("mac")) return agent.pathMac;
    return agent.pathLinux;
  }

  function mcpServerEntry(runtime) {
    const catalog = defaultCatalogPath();
    if (runtime === "noclone" || runtime === "private") {
      return {
        type: "stdio",
        command: "agenthub-mcp",
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
        args: ["-y", "@agenthub/mcp@latest", "--stdio"],
        env: {
          AGENTHUB_CATALOG_PATH: catalog,
          AGENTHUB_BUNDLE: FULL_BUNDLE_PRESET,
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
      command: "agenthub-mcp",
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
    if (wrap) return JSON.stringify(fragment, null, 2);
    return JSON.stringify(fragment, null, 2);
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

  function openAgentModal(agentId) {
    const agent = AGENTS[agentId];
    if (!agent) return;
    const overlay = document.getElementById("agent-modal");
    const title = document.getElementById("modal-title");
    const pathEl = document.getElementById("modal-path");
    const configPre = document.getElementById("modal-config");
    const connectCmd = document.getElementById("modal-connect-cmd");

    title.textContent = `Connect ${agent.name}`;
    pathEl.textContent = agentPath(agent) + (agent.pathNote ? ` — ${agent.pathNote}` : "");

    const config = buildMcpConfig("python", agent.wrap);
    configPre.textContent = config;

    const connectBlock = connectCmd.closest(".connect-cmd-block");
    const copyConnectBtn = document.getElementById("modal-copy-connect");
    if (agent.outputFlag) {
      connectCmd.textContent = `agenthub connect --catalog ~/.agenthub --output ${agent.outputFlag}`;
      connectBlock.hidden = false;
      copyConnectBtn.hidden = false;
    } else {
      connectBlock.hidden = true;
      copyConnectBtn.hidden = true;
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
    const privatePre = document.getElementById("config-private-repo");
    if (pythonPre) pythonPre.textContent = buildMcpConfig("python", false);
    if (npmPre) npmPre.textContent = buildMcpConfig("npm", false);
    if (devPre) devPre.textContent = buildMcpConfig("dev", false);
    if (privatePre) privatePre.textContent = buildMcpConfig("noclone", false);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCopyButtons();
    initNav();
    initTabs();
    initAgentCards();
    renderBundles();
    initDocLinks();
    initSetupTabsContent();
  });
})();

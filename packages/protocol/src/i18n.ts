import { z } from "zod";

export const SUPPORTED_LOCALES = ["en", "zh-CN", "ja", "es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE = "en" as Locale;

export const LocaleSchema = z.enum(SUPPORTED_LOCALES);

// 翻译键类型
export interface Translations {
  [key: string]: string | Translations;
}

// 英文翻译
export const EN_TRANSLATIONS: Translations = {
  common: {
    loading: "Loading...",
    saving: "Saving...",
    error: "An error occurred",
    success: "Success",
    confirm: "Confirm",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    create: "Create",
    update: "Update",
    search: "Search...",
    filter: "Filter",
    sort: "Sort",
    noResults: "No results found",
    reset: "Reset",
    apply: "Apply",
    close: "Close",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
  },
  nav: {
    agents: "Agents",
    kanban: "Board",
    skills: "Skills",
    squads: "Squads",
    settings: "Settings",
    workspace: "Workspace",
  },
  agents: {
    title: "Agents",
    create: "Create Agent",
    name: "Name",
    model: "Model",
    provider: "Provider",
    status: {
      online: "Online",
      offline: "Offline",
      busy: "Busy",
    },
    statusChanged: "Agent status changed",
    skills: "Skills",
    systemPrompt: "System Prompt",
    noAgents: "No agents yet. Create one to get started!",
    runningNow: "Running now",
    recentlyStopped: "Recently stopped",
  },
  issues: {
    title: "Issues",
    create: "Create Issue",
    edit: "Edit Issue",
    name: "Name",
    description: "Description",
    priority: {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    status: {
      backlog: "Backlog",
      todo: "To Do",
      in_progress: "In Progress",
      in_review: "In Review",
      done: "Done",
    },
    assignee: "Assignee",
    labels: "Labels",
    comments: "Comments",
    created: "Created",
    updated: "Updated",
    noIssues: "No issues yet. Create one to get started!",
    blockedBy: "Blocked by",
    blocks: "Blocks",
  },
  skills: {
    title: "Skills",
    create: "Create Skill",
    edit: "Edit Skill",
    name: "Name",
    description: "Description",
    category: "Category",
    categories: {
      coding: "Coding",
      writing: "Writing",
      analysis: "Analysis",
      automation: "Automation",
      communication: "Communication",
    },
    tags: "Tags",
    code: "Code",
    author: "Author",
    downloads: "Downloads",
    rating: "Rating",
    install: "Install",
    uninstall: "Uninstall",
    installed: "Installed",
    examples: "Examples",
    verification: "Verification Steps",
    recommended: "Recommended for you",
    trending: "Trending now",
    popular: "Most popular",
  },
  squads: {
    title: "Squads",
    create: "Create Squad",
    edit: "Edit Squad",
    name: "Name",
    description: "Description",
    color: "Color",
    members: "Members",
    roles: {
      lead: "Lead",
      advisor: "Advisor",
      member: "Member",
    },
    addMember: "Add Member",
    removeMember: "Remove Member",
    noSquads: "No squads yet. Create one to get started!",
  },
  projects: {
    title: "Projects",
    create: "Create Project",
    edit: "Edit Project",
    name: "Name",
    description: "Description",
    key: "Key",
    lead: "Lead",
    members: "Members",
    noProjects: "No projects yet. Create one to get started!",
  },
  schedule: {
    title: "Schedules",
    create: "Create Schedule",
    edit: "Edit Schedule",
    name: "Name",
    cron: "Cron Expression",
    timezone: "Timezone",
    nextRun: "Next Run",
    lastRun: "Last Run",
    status: {
      active: "Active",
      paused: "Paused",
      failed: "Failed",
    },
    pause: "Pause",
    resume: "Resume",
    runNow: "Run Now",
  },
  webhooks: {
    title: "Webhooks",
    create: "Create Webhook",
    edit: "Edit Webhook",
    name: "Name",
    url: "URL",
    events: "Events",
    secret: "Secret",
    test: "Test",
  },
  auth: {
    login: "Login",
    logout: "Logout",
    apiKey: "API Key",
    provider: "Provider",
  },
  settings: {
    title: "Settings",
    general: "General",
    appearance: "Appearance",
    theme: {
      dark: "Dark",
      light: "Light",
      system: "System",
    },
    language: "Language",
    notifications: "Notifications",
    keyboardShortcuts: "Keyboard Shortcuts",
  },
};

// 中文翻译
export const ZH_CN_TRANSLATIONS: Translations = {
  common: {
    loading: "加载中...",
    saving: "保存中...",
    error: "发生错误",
    success: "成功",
    confirm: "确认",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    save: "保存",
    create: "创建",
    update: "更新",
    search: "搜索...",
    filter: "筛选",
    sort: "排序",
    noResults: "没有找到结果",
    reset: "重置",
    apply: "应用",
    close: "关闭",
    yes: "是",
    no: "否",
    back: "返回",
    next: "下一步",
    previous: "上一步",
    finish: "完成",
  },
  nav: {
    agents: "智能体",
    kanban: "看板",
    skills: "技能",
    squads: "团队",
    settings: "设置",
    workspace: "工作区",
  },
  agents: {
    title: "智能体",
    create: "创建智能体",
    name: "名称",
    model: "模型",
    provider: "提供商",
    status: {
      online: "在线",
      offline: "离线",
      busy: "忙碌",
    },
    statusChanged: "智能体状态已变更",
    skills: "技能",
    systemPrompt: "系统提示词",
    noAgents: "暂无智能体。创建一个开始吧！",
    runningNow: "正在运行",
    recentlyStopped: "最近停止",
  },
  issues: {
    title: "任务",
    create: "创建任务",
    edit: "编辑任务",
    name: "标题",
    description: "描述",
    priority: {
      critical: "紧急",
      high: "高",
      medium: "中",
      low: "低",
    },
    status: {
      backlog: "待办",
      todo: "待处理",
      in_progress: "进行中",
      in_review: "审核中",
      done: "已完成",
    },
    assignee: "负责人",
    labels: "标签",
    comments: "评论",
    created: "创建时间",
    updated: "更新时间",
    noIssues: "暂无任务。创建一个开始吧！",
    blockedBy: "被阻塞",
    blocks: "阻塞",
  },
  skills: {
    title: "技能",
    create: "创建技能",
    edit: "编辑技能",
    name: "名称",
    description: "描述",
    category: "分类",
    categories: {
      coding: "编程",
      writing: "写作",
      analysis: "分析",
      automation: "自动化",
      communication: "沟通",
    },
    tags: "标签",
    code: "代码",
    author: "作者",
    downloads: "下载",
    rating: "评分",
    install: "安装",
    uninstall: "卸载",
    installed: "已安装",
    examples: "示例",
    verification: "验证步骤",
    recommended: "为你推荐",
    trending: "正在流行",
    popular: "最受欢迎",
  },
  squads: {
    title: "团队",
    create: "创建团队",
    edit: "编辑团队",
    name: "名称",
    description: "描述",
    color: "颜色",
    members: "成员",
    roles: {
      lead: "负责人",
      advisor: "顾问",
      member: "成员",
    },
    addMember: "添加成员",
    removeMember: "移除成员",
    noSquads: "暂无团队。创建一个开始吧！",
  },
  projects: {
    title: "项目",
    create: "创建项目",
    edit: "编辑项目",
    name: "名称",
    description: "描述",
    key: "标识",
    lead: "负责人",
    members: "成员",
    noProjects: "暂无项目。创建一个开始吧！",
  },
  schedule: {
    title: "定时任务",
    create: "创建定时任务",
    edit: "编辑定时任务",
    name: "名称",
    cron: "Cron 表达式",
    timezone: "时区",
    nextRun: "下次运行",
    lastRun: "上次运行",
    status: {
      active: "活跃",
      paused: "已暂停",
      failed: "失败",
    },
    pause: "暂停",
    resume: "继续",
    runNow: "立即运行",
  },
  webhooks: {
    title: "Webhook",
    create: "创建 Webhook",
    edit: "编辑 Webhook",
    name: "名称",
    url: "URL",
    events: "事件",
    secret: "密钥",
    test: "测试",
  },
  auth: {
    login: "登录",
    logout: "登出",
    apiKey: "API 密钥",
    provider: "提供商",
  },
  settings: {
    title: "设置",
    general: "通用",
    appearance: "外观",
    theme: {
      dark: "深色",
      light: "浅色",
      system: "跟随系统",
    },
    language: "语言",
    notifications: "通知",
    keyboardShortcuts: "快捷键",
  },
};

// 日文翻译
export const JA_TRANSLATIONS: Translations = {
  common: {
    loading: "読み込み中...",
    saving: "保存中...",
    error: "エラーが発生しました",
    success: "成功",
    confirm: "確認",
    cancel: "キャンセル",
    delete: "削除",
    edit: "編集",
    save: "保存",
    create: "作成",
    update: "更新",
    search: "検索...",
    filter: "フィルター",
    sort: "並べ替え",
    noResults: "結果が見つかりません",
    reset: "リセット",
    apply: "適用",
    close: "閉じる",
    yes: "はい",
    no: "いいえ",
    back: "戻る",
    next: "次へ",
    previous: "前へ",
    finish: "完了",
  },
  nav: {
    agents: "エージェント",
    kanban: "ボード",
    skills: "スキル",
    squads: "スクワッド",
    settings: "設定",
    workspace: "ワークスペース",
  },
};

// 西班牙文翻译
export const ES_TRANSLATIONS: Translations = {
  common: {
    loading: "Cargando...",
    saving: "Guardando...",
    error: "Ocurrió un error",
    success: "Éxito",
    confirm: "Confirmar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    save: "Guardar",
    create: "Crear",
    update: "Actualizar",
    search: "Buscar...",
    filter: "Filtrar",
    sort: "Ordenar",
    noResults: "No se encontraron resultados",
    reset: "Restablecer",
    apply: "Aplicar",
    close: "Cerrar",
    yes: "Sí",
    no: "No",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar",
  },
  nav: {
    agents: "Agentes",
    kanban: "Panel",
    skills: "Habilidades",
    squads: "Equipos",
    settings: "Configuración",
    workspace: "Espacio de trabajo",
  },
};

export const TRANSLATIONS: Record<Locale, Translations> = {
  en: EN_TRANSLATIONS,
  "zh-CN": ZH_CN_TRANSLATIONS,
  ja: JA_TRANSLATIONS,
  es: ES_TRANSLATIONS,
};

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as any);
}

export function getLocale(locale: string): Locale {
  if (isSupportedLocale(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

export function getTranslations(locale: Locale): Translations {
  return TRANSLATIONS[locale] || TRANSLATIONS[DEFAULT_LOCALE];
}

export class I18n {
  private currentLocale: Locale;
  private translations: Translations;
  private listeners: ((locale: Locale) => void)[] = [];

  constructor(locale: Locale = DEFAULT_LOCALE) {
    this.currentLocale = locale;
    this.translations = getTranslations(locale);
  }

  getLocale(): Locale {
    return this.currentLocale;
  }

  setLocale(locale: Locale): void {
    this.currentLocale = locale;
    this.translations = getTranslations(locale);
    this.notifyListeners(locale);
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split(".");
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // 回退到英文
        value = this.getFallbackTranslation(key);
        break;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    if (params) {
      return value.replace(/{([^}]+)}/g, (_, key) => {
        return params[key] != null ? String(params[key]) : `{${key}}`;
      });
    }

    return value;
  }

  private getFallbackTranslation(key: string): string | undefined {
    const keys = key.split(".");
    let value: any = TRANSLATIONS[DEFAULT_LOCALE];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return typeof value === "string" ? value : undefined;
  }

  addListener(listener: (locale: Locale) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(locale: Locale): void {
    this.listeners.forEach((listener) => listener(locale));
  }
}

let defaultI18n: I18n | null = null;

export function getI18n(locale?: Locale): I18n {
  if (!defaultI18n) {
    defaultI18n = new I18n(locale);
  } else if (locale) {
    defaultI18n.setLocale(locale);
  }
  return defaultI18n;
}

export function t(key: string, params?: Record<string, string | number>): string {
  return getI18n().t(key, params);
}

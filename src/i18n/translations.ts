export const translations = {
  en: {
    // Header
    workflows: 'Workflows',
    simulateInvoiceEmail: 'Simulate Invoice Email',

    // Status
    pending: 'Pending',
    pendingApproval: 'Pending Approval',
    approved: 'Approved',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',

    // Sections
    needsAttention: 'Needs Attention',
    completedToday: 'Completed',

    // Actions
    approve: 'Approve',
    reject: 'Reject',
    retry: 'Retry',
    dismiss: 'Dismiss',
    back: 'Back',

    // Workflow types
    invoiceProcessing: 'Invoice Processing',

    // Empty state
    noWorkflowsYet: 'No workflows yet',
    clickSimulateToCreate: 'Click "Simulate Invoice Email" to create a workflow',
    selectWorkflowToView: 'Select a workflow to view details',

    // Card details
    items: 'items',
    newSku: 'new SKU',
    newSkus: 'new SKUs',
    processing: 'Processing...',

    // Detail view
    trigger: 'Trigger',
    emailFrom: 'Email from',
    received: 'Received',
    extractedData: 'Extracted Data',
    supplier: 'Supplier',
    invoiceNumber: 'Invoice #',
    date: 'Date',
    total: 'Total',
    lineItems: 'Line Items',
    plannedActions: 'Planned Actions',
    progress: 'Progress',
    error: 'Error',

    // Tasks
    parseInvoice: 'Parse Invoice',
    createSku: 'Create SKU',
    registerInvoice: 'Register Invoice',
    updateInventory: 'Update Inventory',

    // Time
    justNow: 'just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',

    // Upload modal
    uploadInvoice: 'Upload Invoice',
    dragDropInvoice: 'Drag and drop your invoice here',
    supportedFormats: 'PDF, XML, PNG, JPG, WebP (max 10MB)',
    selectFile: 'Select File',
    uploadingFile: 'Uploading file...',
    analyzingInvoice: 'Analyzing invoice with AI...',
    extractionFailed: 'Failed to extract data',
    tryAgain: 'Try Again',
    dataExtracted: 'Data extracted successfully',
    uploadDifferent: 'Upload Different',
    createWorkflow: 'Create Workflow',
    invalidFileType: 'Invalid file type. Please use PDF, XML, or images.',
    fileTooLarge: 'File too large. Maximum size is 10MB.',
    orUploadManually: 'or upload invoice',
  },
  'pt-BR': {
    // Header
    workflows: 'Fluxos de Trabalho',
    simulateInvoiceEmail: 'Simular Email de Nota Fiscal',

    // Status
    pending: 'Pendente',
    pendingApproval: 'Aguardando Aprovacao',
    approved: 'Aprovado',
    running: 'Executando',
    completed: 'Concluido',
    failed: 'Falhou',

    // Sections
    needsAttention: 'Requer Atencao',
    completedToday: 'Concluidos',

    // Actions
    approve: 'Aprovar',
    reject: 'Rejeitar',
    retry: 'Tentar Novamente',
    dismiss: 'Dispensar',
    back: 'Voltar',

    // Workflow types
    invoiceProcessing: 'Processamento de Nota Fiscal',

    // Empty state
    noWorkflowsYet: 'Nenhum fluxo ainda',
    clickSimulateToCreate: 'Clique em "Simular Email de Nota Fiscal" para criar um fluxo',
    selectWorkflowToView: 'Selecione um fluxo para ver detalhes',

    // Card details
    items: 'itens',
    newSku: 'novo SKU',
    newSkus: 'novos SKUs',
    processing: 'Processando...',

    // Detail view
    trigger: 'Gatilho',
    emailFrom: 'Email de',
    received: 'Recebido',
    extractedData: 'Dados Extraidos',
    supplier: 'Fornecedor',
    invoiceNumber: 'Nota Fiscal #',
    date: 'Data',
    total: 'Total',
    lineItems: 'Itens',
    plannedActions: 'Acoes Planejadas',
    progress: 'Progresso',
    error: 'Erro',

    // Tasks
    parseInvoice: 'Analisar Nota Fiscal',
    createSku: 'Criar SKU',
    registerInvoice: 'Registrar Nota Fiscal',
    updateInventory: 'Atualizar Estoque',

    // Time
    justNow: 'agora',
    minutesAgo: 'min atras',
    hoursAgo: 'h atras',
    daysAgo: 'd atras',

    // Upload modal
    uploadInvoice: 'Enviar Nota Fiscal',
    dragDropInvoice: 'Arraste e solte sua nota fiscal aqui',
    supportedFormats: 'PDF, XML, PNG, JPG, WebP (max 10MB)',
    selectFile: 'Selecionar Arquivo',
    uploadingFile: 'Enviando arquivo...',
    analyzingInvoice: 'Analisando nota fiscal com IA...',
    extractionFailed: 'Falha ao extrair dados',
    tryAgain: 'Tentar Novamente',
    dataExtracted: 'Dados extraidos com sucesso',
    uploadDifferent: 'Enviar Outro',
    createWorkflow: 'Criar Fluxo',
    invalidFileType: 'Tipo de arquivo invalido. Use PDF, XML ou imagens.',
    fileTooLarge: 'Arquivo muito grande. Tamanho maximo e 10MB.',
    orUploadManually: 'ou enviar nota fiscal',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations['en'];

// Simple i18n translation system
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ar' | 'hi' | 'zh';

export interface Translations {
  // Navigation
  home: string;
  newEntry: string;
  moodTracker: string;
  secretEntries: string;
  aiFeatures: string;
  settings: string;
  
  // Common actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  back: string;
  close: string;
  
  // Entry form
  titlePlaceholder: string;
  contentPlaceholder: string;
  selectMood: string;
  addImages: string;
  addVideos: string;
  recordVoice: string;
  markAsPrivate: string;
  
  // Mood selector
  happy: string;
  sad: string;
  anxious: string;
  calm: string;
  excited: string;
  tired: string;
  
  // Emotions
  joy: string;
  gratitude: string;
  love: string;
  fear: string;
  anger: string;
  surprise: string;
  
  // Messages
  entrySaved: string;
  entryDeleted: string;
  errorSaving: string;
  recordingStarted: string;
  uploadSuccess: string;
  uploadError: string;
  
  // Settings
  language: string;
  theme: string;
  notifications: string;
  secretLock: string;
  
  // Misc
  todaysPrompt: string;
  characterCount: string;
  saving: string;
  loading: string;
}

const translations: Record<Language, Translations> = {
  en: {
    home: 'Home',
    newEntry: 'New Entry',
    moodTracker: 'Mood Tracker',
    secretEntries: 'Secret Entries',
    aiFeatures: 'AI Features',
    settings: 'Settings',
    
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    close: 'Close',
    
    titlePlaceholder: 'Give your entry a title (optional)',
    contentPlaceholder: "What's on your mind today?",
    selectMood: 'How are you feeling?',
    addImages: 'Add Images',
    addVideos: 'Add Videos',
    recordVoice: 'Record Voice',
    markAsPrivate: 'Mark as private',
    
    happy: 'Happy',
    sad: 'Sad',
    anxious: 'Anxious',
    calm: 'Calm',
    excited: 'Excited',
    tired: 'Tired',
    
    joy: 'Joy',
    gratitude: 'Gratitude',
    love: 'Love',
    fear: 'Fear',
    anger: 'Anger',
    surprise: 'Surprise',
    
    entrySaved: 'Entry saved!',
    entryDeleted: 'Entry deleted!',
    errorSaving: 'Failed to save entry',
    recordingStarted: 'Recording started',
    uploadSuccess: 'Upload successful!',
    uploadError: 'Failed to upload',
    
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    secretLock: 'Secret Lock',
    
    todaysPrompt: "Today's Prompt",
    characterCount: 'characters',
    saving: 'Saving...',
    loading: 'Loading...',
  },
  
  es: {
    home: 'Inicio',
    newEntry: 'Nueva Entrada',
    moodTracker: 'Monitor de Estado de Ánimo',
    secretEntries: 'Entradas Secretas',
    aiFeatures: 'Características de IA',
    settings: 'Configuración',
    
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    back: 'Volver',
    close: 'Cerrar',
    
    titlePlaceholder: 'Dale un título a tu entrada (opcional)',
    contentPlaceholder: '¿Qué tienes en mente hoy?',
    selectMood: '¿Cómo te sientes?',
    addImages: 'Agregar Imágenes',
    addVideos: 'Agregar Videos',
    recordVoice: 'Grabar Voz',
    markAsPrivate: 'Marcar como privado',
    
    happy: 'Feliz',
    sad: 'Triste',
    anxious: 'Ansioso',
    calm: 'Tranquilo',
    excited: 'Emocionado',
    tired: 'Cansado',
    
    joy: 'Alegría',
    gratitude: 'Gratitud',
    love: 'Amor',
    fear: 'Miedo',
    anger: 'Enojo',
    surprise: 'Sorpresa',
    
    entrySaved: '¡Entrada guardada!',
    entryDeleted: '¡Entrada eliminada!',
    errorSaving: 'Error al guardar entrada',
    recordingStarted: 'Grabación iniciada',
    uploadSuccess: '¡Carga exitosa!',
    uploadError: 'Error al cargar',
    
    language: 'Idioma',
    theme: 'Tema',
    notifications: 'Notificaciones',
    secretLock: 'Bloqueo Secreto',
    
    todaysPrompt: 'Mensaje del Día',
    characterCount: 'caracteres',
    saving: 'Guardando...',
    loading: 'Cargando...',
  },
  
  fr: {
    home: 'Accueil',
    newEntry: 'Nouvelle Entrée',
    moodTracker: "Suivi de l'Humeur",
    secretEntries: 'Entrées Secrètes',
    aiFeatures: "Fonctionnalités d'IA",
    settings: 'Paramètres',
    
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    back: 'Retour',
    close: 'Fermer',
    
    titlePlaceholder: 'Donnez un titre à votre entrée (facultatif)',
    contentPlaceholder: "Qu'avez-vous en tête aujourd'hui?",
    selectMood: 'Comment vous sentez-vous?',
    addImages: 'Ajouter des Images',
    addVideos: 'Ajouter des Vidéos',
    recordVoice: 'Enregistrer la Voix',
    markAsPrivate: 'Marquer comme privé',
    
    happy: 'Heureux',
    sad: 'Triste',
    anxious: 'Anxieux',
    calm: 'Calme',
    excited: 'Excité',
    tired: 'Fatigué',
    
    joy: 'Joie',
    gratitude: 'Gratitude',
    love: 'Amour',
    fear: 'Peur',
    anger: 'Colère',
    surprise: 'Surprise',
    
    entrySaved: 'Entrée enregistrée!',
    entryDeleted: 'Entrée supprimée!',
    errorSaving: "Échec de l'enregistrement",
    recordingStarted: 'Enregistrement démarré',
    uploadSuccess: 'Téléchargement réussi!',
    uploadError: 'Échec du téléchargement',
    
    language: 'Langue',
    theme: 'Thème',
    notifications: 'Notifications',
    secretLock: 'Verrouillage Secret',
    
    todaysPrompt: 'Prompt du Jour',
    characterCount: 'caractères',
    saving: 'Enregistrement...',
    loading: 'Chargement...',
  },
  
  de: {
    home: 'Startseite',
    newEntry: 'Neuer Eintrag',
    moodTracker: 'Stimmungs-Tracker',
    secretEntries: 'Geheime Einträge',
    aiFeatures: 'KI-Funktionen',
    settings: 'Einstellungen',
    
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    back: 'Zurück',
    close: 'Schließen',
    
    titlePlaceholder: 'Geben Sie Ihrem Eintrag einen Titel (optional)',
    contentPlaceholder: 'Was beschäftigt Sie heute?',
    selectMood: 'Wie fühlen Sie sich?',
    addImages: 'Bilder hinzufügen',
    addVideos: 'Videos hinzufügen',
    recordVoice: 'Stimme aufnehmen',
    markAsPrivate: 'Als privat markieren',
    
    happy: 'Glücklich',
    sad: 'Traurig',
    anxious: 'Ängstlich',
    calm: 'Ruhig',
    excited: 'Aufgeregt',
    tired: 'Müde',
    
    joy: 'Freude',
    gratitude: 'Dankbarkeit',
    love: 'Liebe',
    fear: 'Angst',
    anger: 'Wut',
    surprise: 'Überraschung',
    
    entrySaved: 'Eintrag gespeichert!',
    entryDeleted: 'Eintrag gelöscht!',
    errorSaving: 'Fehler beim Speichern',
    recordingStarted: 'Aufnahme gestartet',
    uploadSuccess: 'Upload erfolgreich!',
    uploadError: 'Upload fehlgeschlagen',
    
    language: 'Sprache',
    theme: 'Thema',
    notifications: 'Benachrichtigungen',
    secretLock: 'Geheimsperre',
    
    todaysPrompt: 'Heutiger Prompt',
    characterCount: 'Zeichen',
    saving: 'Speichern...',
    loading: 'Laden...',
  },
  
  ar: {
    home: 'الرئيسية',
    newEntry: 'إدخال جديد',
    moodTracker: 'متتبع المزاج',
    secretEntries: 'الإدخالات السرية',
    aiFeatures: 'ميزات الذكاء الاصطناعي',
    settings: 'الإعدادات',
    
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تحرير',
    back: 'رجوع',
    close: 'إغلاق',
    
    titlePlaceholder: 'أعط إدخالك عنوانًا (اختياري)',
    contentPlaceholder: 'ما الذي يدور في ذهنك اليوم؟',
    selectMood: 'كيف تشعر؟',
    addImages: 'إضافة صور',
    addVideos: 'إضافة فيديوهات',
    recordVoice: 'تسجيل الصوت',
    markAsPrivate: 'وضع علامة كخاص',
    
    happy: 'سعيد',
    sad: 'حزين',
    anxious: 'قلق',
    calm: 'هادئ',
    excited: 'متحمس',
    tired: 'متعب',
    
    joy: 'فرح',
    gratitude: 'امتنان',
    love: 'حب',
    fear: 'خوف',
    anger: 'غضب',
    surprise: 'مفاجأة',
    
    entrySaved: 'تم حفظ الإدخال!',
    entryDeleted: 'تم حذف الإدخال!',
    errorSaving: 'فشل في حفظ الإدخال',
    recordingStarted: 'بدأ التسجيل',
    uploadSuccess: 'تم الرفع بنجاح!',
    uploadError: 'فشل الرفع',
    
    language: 'اللغة',
    theme: 'المظهر',
    notifications: 'الإشعارات',
    secretLock: 'القفل السري',
    
    todaysPrompt: 'موجه اليوم',
    characterCount: 'حرف',
    saving: 'جاري الحفظ...',
    loading: 'جاري التحميل...',
  },
  
  hi: {
    home: 'होम',
    newEntry: 'नई प्रविष्टि',
    moodTracker: 'मूड ट्रैकर',
    secretEntries: 'गुप्त प्रविष्टियां',
    aiFeatures: 'एआई सुविधाएं',
    settings: 'सेटिंग्स',
    
    save: 'सेव करें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    back: 'वापस',
    close: 'बंद करें',
    
    titlePlaceholder: 'अपनी प्रविष्टि को शीर्षक दें (वैकल्पिक)',
    contentPlaceholder: 'आज आपके मन में क्या है?',
    selectMood: 'आप कैसा महसूस कर रहे हैं?',
    addImages: 'चित्र जोड़ें',
    addVideos: 'वीडियो जोड़ें',
    recordVoice: 'आवाज़ रिकॉर्ड करें',
    markAsPrivate: 'निजी के रूप में चिह्नित करें',
    
    happy: 'खुश',
    sad: 'उदास',
    anxious: 'चिंतित',
    calm: 'शांत',
    excited: 'उत्साहित',
    tired: 'थका हुआ',
    
    joy: 'आनंद',
    gratitude: 'कृतज्ञता',
    love: 'प्यार',
    fear: 'डर',
    anger: 'गुस्सा',
    surprise: 'आश्चर्य',
    
    entrySaved: 'प्रविष्टि सेव हो गई!',
    entryDeleted: 'प्रविष्टि हटा दी गई!',
    errorSaving: 'सेव करने में विफल',
    recordingStarted: 'रिकॉर्डिंग शुरू हुई',
    uploadSuccess: 'अपलोड सफल!',
    uploadError: 'अपलोड विफल',
    
    language: 'भाषा',
    theme: 'थीम',
    notifications: 'सूचनाएं',
    secretLock: 'गुप्त लॉक',
    
    todaysPrompt: 'आज का प्रॉम्प्ट',
    characterCount: 'अक्षर',
    saving: 'सेव हो रहा है...',
    loading: 'लोड हो रहा है...',
  },
  
  zh: {
    home: '首页',
    newEntry: '新条目',
    moodTracker: '心情追踪器',
    secretEntries: '秘密条目',
    aiFeatures: '人工智能功能',
    settings: '设置',
    
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    back: '返回',
    close: '关闭',
    
    titlePlaceholder: '给你的条目起个标题（可选）',
    contentPlaceholder: '今天你在想什么？',
    selectMood: '你感觉如何？',
    addImages: '添加图片',
    addVideos: '添加视频',
    recordVoice: '录音',
    markAsPrivate: '标记为私密',
    
    happy: '快乐',
    sad: '悲伤',
    anxious: '焦虑',
    calm: '平静',
    excited: '兴奋',
    tired: '疲倦',
    
    joy: '喜悦',
    gratitude: '感激',
    love: '爱',
    fear: '恐惧',
    anger: '愤怒',
    surprise: '惊讶',
    
    entrySaved: '条目已保存！',
    entryDeleted: '条目已删除！',
    errorSaving: '保存失败',
    recordingStarted: '录音开始',
    uploadSuccess: '上传成功！',
    uploadError: '上传失败',
    
    language: '语言',
    theme: '主题',
    notifications: '通知',
    secretLock: '秘密锁',
    
    todaysPrompt: '今日提示',
    characterCount: '字符',
    saving: '正在保存...',
    loading: '正在加载...',
  },
};

export const getTranslation = (language: Language): Translations => {
  return translations[language] || translations.en;
};

export const t = (key: keyof Translations, language: Language = 'en'): string => {
  const translation = getTranslation(language);
  return translation[key] || key;
};

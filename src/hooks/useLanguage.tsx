import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Language, getTranslation, Translations } from '@/lib/i18n';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState<Translations>(getTranslation('en'));

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('id', user.id)
          .single();

        if (data?.language_preference) {
          const lang = data.language_preference as Language;
          setLanguage(lang);
          setT(getTranslation(lang));
          
          // Set HTML lang attribute for accessibility
          document.documentElement.lang = lang;
          
          // Set direction for RTL languages
          if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
          } else {
            document.documentElement.dir = 'ltr';
          }
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadLanguage();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { language, t };
};

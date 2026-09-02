import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import kn from "./locales/kn.json";


const savedLanguage =
  localStorage.getItem("language") || "en";


i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },

      hi: {
        translation: hi
      },

      kn: {
        translation: kn
      }
    },

    lng: savedLanguage,

    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });


// Save language whenever it changes
i18n.on("languageChanged", (language) => {
  localStorage.setItem("language", language);
});


export default i18n;
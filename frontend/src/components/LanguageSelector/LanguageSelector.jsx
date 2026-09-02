import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    i18n.changeLanguage(selectedLanguage);

    localStorage.setItem("language", selectedLanguage);
  };

  return (
    <select
      className="language-select"
      value={i18n.language}
      onChange={handleLanguageChange}
      aria-label="Select language"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="kn">ಕನ್ನಡ</option>
    </select>
  );
};

export default LanguageSelector;
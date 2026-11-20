
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  lo: {
    translation: {
      appName: "ລະບົບຈັດການຫ້ອງປະຊຸມ",
      welcome: "ຍິນດີຕ້ອນຮັບ",
      login: "ເຂົ້າລະບົບ",
      logout: "ອອກຈາກລະບົບ",
      username: "ຊື່ຜູ້ໃຊ້",
      password: "ລະຫັດຜ່ານ",
      dashboard: "ໜ້າຫຼັກ",
      bookings: "ການຈອງຫ້ອງ",
      rooms: "ຫ້ອງປະຊຸມ",
      notifications: "ການແຈ້ງເຕືອນ",
      users: "ຈັດການຜູ້ໃຊ້",
      reports: "ລາຍງານ",
      settings: "ຕັ້ງຄ່າ"
    }
  },

  en: {
    translation: {
      appName: "Meeting Room Management System",
      welcome: "Welcome",
      login: "Login",
      logout: "Logout",
      username: "Username",
      password: "Password",
      dashboard: "Dashboard",
      bookings: "Bookings",
      rooms: "Meeting Rooms",
      notifications: "Notifications",
      users: "User Management",
      reports: "Reports",
      settings: "Settings"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "lo",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

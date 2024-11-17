/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        default: "#333333",
        primary: "#164bad",
        secondary: "#1f69f3",
        tertiary: "#3e3e3e",
        emphasize: "#1D1D1F",
        deemphasize: "#6e6e73",

        done: "#059061",
        save: "#13A9A1",
        label: "#424242",
        noData: "#ababab",
        edit: "#f39d4e",
        delete: "#ff4747",
        bgTableHeader: "#dfebff",
        hover: "#efefef",
        error: "#fa5252",
        disable: "#f1f3f5",
      },
      screens: {
        sm: "1024px",
        ipad11: "1180px",
        macair133: "1200px",
        samsungA24: "1910px",
      },
      fontSize: {
        h1: "20px",
        h2: "18px",
        b1: "16px",
        b2: "14px",
        b3: "12px",
      },
      // screens: {
      //   tablet: "640px",
      //   laptop: "1024px",
      //   desktop: "1280px",
      // },
    },
    fontFamily: {
      notoThai: ["NotoSansThai"],
      manrope: ["Manrope"],
    },
  },
  plugins: [],
};

import React, { useState } from "react";
import { motion } from "framer-motion";
import GeospatialMap from "@/_mahameru/geospatial/components/GeospatialMap";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/global/utils/tailwind-merge";

type MenuItem = {
  icon?: string;
  title: string;
  path?: string;
  submenu?: MenuItem[];
};

const menuData: MenuItem[] = [
  {
    icon: "dashboard",
    title: "Dashboard",
    path: "/app/dashboard",
  },
  {
    icon: "account",
    title: "Profile",
    submenu: [
      { title: "Setting", path: "/app/profile/setting" },
      { title: "Activity", path: "/app/profile/activity" },
    ],
  },
];

const Sidebar: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "bento";
}> = ({ children, variant = "default" }) => {
  const [expanded, setExpanded] = useState<boolean>(variant === "default");
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex h-screen">
      <motion.div
        className={cn(
          "relative bg-dark-800 pt-14 text-white z-[1000]",
          variant === "bento" && "bg-transparent p-3 fixed"
        )}
        initial={false}
        animate={{ width: expanded ? "16rem" : "4rem" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute right-0 top-0 mt-2 -mr-4 bg-gray-700 p-1 rounded-full"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <ul className="mt-10 space-y-2">
          {menuData.map((item, index) => (
            <li key={index} className="relative">
              <div
                onClick={() => item.submenu && toggleMenu(item.title)}
                onMouseEnter={() =>
                  !expanded && item.submenu && toggleMenu(item.title)
                }
                onMouseLeave={() => !expanded && setOpenMenus({})}
              >
                <a
                  href={item.path}
                  className="flex items-center px-4 py-2 hover:bg-gray-700"
                >
                  <span className={`icon-${item.icon} w-6 h-6`} />
                  <span className={`ml-3 ${!expanded && "hidden"}`}>
                    {item.title}
                  </span>
                  {item.submenu && (
                    <svg
                      className={`ml-auto w-4 h-4 transition-transform ${
                        openMenus[item.title] ? "rotate-90" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </a>

                {item.submenu && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: openMenus[item.title] ? 1 : 0,
                      height: openMenus[item.title] ? "auto" : 0,
                    }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={`${openMenus[item.title] ? "block" : "hidden"} ${
                      expanded ? "mt-1" : "absolute left-full top-0 ml-2"
                    } bg-gray-700 rounded p-2`}
                  >
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <a
                          href={subItem.path}
                          className="block px-4 py-1 text-sm text-gray-400 hover:text-white"
                        >
                          {subItem.title}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="w-full fixed h-screen flex grow">{children}</div>
    </div>
  );
};

const Home: React.FC = () => (
  <div className="">
    <Sidebar variant="default">
      <GeospatialMap />
    </Sidebar>
  </div>
);

export default Home;

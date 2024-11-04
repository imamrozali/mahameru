import React, { useState } from "react";
import { motion } from "framer-motion";
import GeospatialMap from "@/_mahameru/geospatial/components/GeospatialMap";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/global/utils/tailwind-merge";

// Definisi tipe untuk item menu
type MenuItem = {
  label: string;
  icon?: JSX.Element;
  link?: string;
  subMenu?: MenuItem[];
};

const menuData: MenuItem[] = [
  {
    label: "Dashboard",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 12l18-12v24L3 12z" />
      </svg>
    ),
    link: "#",
  },
  {
    label: "Settings",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 12h10V2z" />
      </svg>
    ),
    subMenu: [
      { label: "Profile", link: "#" },
      { label: "Account", link: "#" },
    ],
  },
  {
    label: "Reports",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2 2h20v20H2z" />
      </svg>
    ),
    link: "#",
  },
];

// Tipe untuk SidebarProps
type SidebarProps = {
  children: React.ReactNode;
  variant?: "default" | "bento";
};

// Komponen Sidebar dengan dukungan TypeScript
const Sidebar: React.FC<SidebarProps> = ({ children, variant = "default" }) => {
  const [expanded, setExpanded] = useState<boolean>(variant === "default");
  const [open, setOpen] = useState<number | null>(null);

  const handleToggleSubMenu = (index: number) => {
    setOpen(open === index ? null : index);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={cn("fixed bg-dark-800 text-white z-[1000] w-full h-14")}
      ></div>
      <motion.div
        className={cn(
          "relative bg-dark-800 pt-14 text-white z-[1000]",
          variant === "bento" && "bg-transparent p-3 fixed"
        )}
        initial={false}
        animate={{ width: expanded ? "16rem" : "4rem" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className={cn(variant === "bento" && "relative bg-dark-800 top-0")}
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

          {/* Dynamic Sidebar Content dari JSON */}
          <ul className="mt-10 space-y-2">
            {menuData.map((item, index) => (
              <li key={index} className="relative">
                <div
                  onClick={() => item.subMenu && handleToggleSubMenu(index)}
                  onMouseEnter={() =>
                    !expanded && item.subMenu && setOpen(index)
                  }
                  onMouseLeave={() => !expanded && setOpen(null)}
                >
                  <a
                    href={item.link}
                    className="flex items-center px-4 py-2 hover:bg-gray-700"
                  >
                    {item.icon}
                    <span className={`ml-3 ${!expanded && "hidden"}`}>
                      {item.label}
                    </span>
                    {item.subMenu && (
                      <svg
                        className={`ml-auto w-4 h-4 transition-transform ${
                          open === index ? "rotate-90" : ""
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

                  {/* Sub-menu */}
                  {item.subMenu && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: open === index ? 1 : 0,
                        height: open === index ? "auto" : 0,
                      }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className={`${open === index ? "block" : "hidden"} ${
                        expanded ? "mt-1" : "absolute left-full top-0 ml-2"
                      } bg-gray-700 rounded p-2`}
                    >
                      {item.subMenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <a
                            href={subItem.link}
                            className="block px-4 py-1 text-sm text-gray-400 hover:text-white"
                          >
                            {subItem.label}
                          </a>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="w-full fixed h-screen flex grow">{children}</div>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="">
      <Sidebar variant="default">
        <GeospatialMap />
      </Sidebar>
    </div>
  );
};

export default Home;

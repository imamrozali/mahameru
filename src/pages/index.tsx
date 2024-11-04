import React, { useState } from "react";
import { motion } from "framer-motion";
import { GeospatialMap } from "@/global/components/geospatial/geospatial";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/global/utils/tailwind-merge";

type SidebarProps = {
  children: React.ReactNode;
  variant?: "default" | "bento";
};

const Sidebar: React.FC<SidebarProps> = ({ children, variant = "default" }) => {
  const [expanded, setExpanded] = useState<boolean>(variant === "default");
  const [open, setOpen] = useState<boolean>(false);

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

          {/* Sidebar Content */}
          <ul className="mt-10 space-y-2">
            <li className="relative">
              <a
                href="#"
                className="flex items-center px-4 py-2 hover:bg-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 12l18-12v24L3 12z" />
                </svg>
                <span className={`ml-3 ${!expanded && "hidden"}`}>
                  Dashboard
                </span>
              </a>
            </li>

            <li
              className="relative"
              onMouseEnter={() => !expanded && setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center w-full px-4 py-2 hover:bg-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 12h10V2z" />
                </svg>
                <span className={`ml-3 ${!expanded && "hidden"}`}>
                  Settings
                </span>
                <svg
                  className={`ml-auto w-4 h-4 transition-transform ${
                    open ? "rotate-90" : ""
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
              </button>

              {/* Sub-menu */}
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: open ? 1 : 0, height: open ? "auto" : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={`${open ? "block" : "hidden"} ${
                  expanded ? "mt-1" : "absolute left-full top-0 ml-2"
                } bg-gray-700 rounded p-2`}
              >
                <li>
                  <a
                    href="#"
                    className="block px-4 py-1 text-sm text-gray-400 hover:text-white"
                  >
                    Profile
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-1 text-sm text-gray-400 hover:text-white"
                  >
                    Account
                  </a>
                </li>
              </motion.ul>
            </li>

            <li className="relative">
              <a
                href="#"
                className="flex items-center px-4 py-2 hover:bg-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2 2h20v20H2z" />
                </svg>
                <span className={`ml-3 ${!expanded && "hidden"}`}>Reports</span>
              </a>
            </li>
          </ul>
        </div>
        {/* Toggle Button */}
      </motion.div>

      {/* Main Content */}
      <div className="w-full fixed h-screen flex grow">{children}</div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="">
      <Sidebar variant="default">
        {/* Uncomment if you want to show the map */}
        <GeospatialMap />
      </Sidebar>
    </div>
  );
}

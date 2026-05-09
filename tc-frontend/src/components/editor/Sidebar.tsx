"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  History,
  Briefcase,
  LayoutTemplate,
  FileJson,
  Layers,
  MousePointer2,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DraggableNode } from "./DraggableNode";
import { Button } from "@/vendors/ui/button";

const sidebarItems = [
  { id: "search", icon: Search, label: "Search" },
  { id: "history", icon: History, label: "History" },
  { id: "briefcase", icon: Briefcase, label: "Projects" },
  { id: "templates", icon: LayoutTemplate, label: "Templates" },
  { id: "files", icon: FileJson, label: "Files" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "pointer", icon: MousePointer2, label: "Selection" },
  { id: "image", icon: ImageIcon, label: "Media" },
  { id: "chat", icon: MessageSquare, label: "Feedback" },
];

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<string | null>("search");
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleTab = (id: string) => {
    if (activeTab === id && isExpanded) {
      setIsExpanded(false);
    } else {
      setActiveTab(id);
      setIsExpanded(true);
    }
  };

  return (
    <div className="flex h-full border-r">
      {/* Icon Bar */}
      <div className="w-14 flex flex-col items-center py-4 gap-2 border-r">
        <div className="mb-6 p-2  rounded-md">
          <div className="w-5 h-5 rounded-sm" />
          {/* Logo placeholder */}
        </div>

        {sidebarItems.slice(0, 6).map((item) => (
          <button
            key={item.id}
            onClick={() => toggleTab(item.id)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              activeTab === item.id && isExpanded
                ? "bg-secondary text-accent-foreground"
                : "hover:bg-secondary text-zinc-500",
            )}
          >
            <item.icon size={20} />
          </button>
        ))}

        <div className="mt-auto flex flex-col items-center gap-2">
          {sidebarItems.slice(6).map((item) => (
            <Button
              key={item.id}
            >
              <item.icon size={20} />
            </Button>
          ))}
          <Button >
            <HelpCircle size={20} />
          </Button>
        </div>
      </div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-r"
          >
            <div className="w-70 h-full flex flex-col">
              <div className="p-4 flex items-center justify-between border-b ">
                <h2 className="font-medium text-sm capitalize">{activeTab}</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === "search" && (
                  <div className="space-y-6">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Search"
                        className="w-full border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                      />
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4">
                        Quick access
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <DraggableNode type="prompt" />
                        <DraggableNode type="import" />
                        <DraggableNode type="export" />
                        <DraggableNode type="preview" />
                        <DraggableNode type="model" />
                        <DraggableNode type="lora" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4">
                        Toolbox
                      </h3>
                      <div className="space-y-1">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded transition-colors">
                          Editing
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm  hover:bg-secondary rounded transition-colors">
                          Generation
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab !== "search" && (
                  <div className="flex flex-col items-center justify-center h-full  italic text-sm">
                    No content for {activeTab} yet
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

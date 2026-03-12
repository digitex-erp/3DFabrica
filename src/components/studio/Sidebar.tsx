import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Settings2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isExpanded: boolean;
  setExpanded: (v: boolean) => void;
  fabrics: any[];
  selectedFabricId?: string;
  onSelectFabric: (f: any) => void;
  onUploadClick: () => void;
  customFabrics: any[];
  controls: React.ReactNode;
  onExportPDF: () => void;
}

export default function Sidebar({
  isExpanded,
  setExpanded,
  fabrics,
  selectedFabricId,
  onSelectFabric,
  onUploadClick,
  customFabrics,
  controls,
  onExportPDF
}: SidebarProps) {
  return (
    <>
      {/* 30px Hover Trigger Zone */}
      {!isExpanded && (
        <div 
          className="fixed left-0 top-0 w-[30px] h-full z-[60] cursor-pointer"
          onMouseEnter={() => setExpanded(true)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r shadow-xl z-50 transition-all duration-300 flex",
          isExpanded ? "w-80" : "w-[30px]"
        )}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className={cn(
          "flex flex-col border-r items-center py-6 gap-6 bg-slate-50 transition-all",
          isExpanded ? "w-16" : "w-[30px]"
        )}>
          <button 
            onClick={() => setExpanded(!isExpanded)}
            className={cn(
              "p-2 hover:bg-slate-200 rounded-lg transition-colors",
              !isExpanded && "opacity-0"
            )}
          >
            {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div className={cn("flex flex-col gap-4 mt-4 transition-all", !isExpanded && "scale-75 opacity-50")}>
             <ImageIcon className="w-6 h-6 text-slate-400" />
             <Upload className="w-6 h-6 text-slate-400" />
             <Settings2 className="w-6 h-6 text-slate-400" />
          </div>
        </div>

      <div className={cn(
        "flex-1 flex flex-col h-full overflow-hidden transition-opacity duration-200",
        !isExpanded && "opacity-0 pointer-events-none"
      )}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-xl text-slate-900">3DFabrica Studio</h2>
        </div>

        <Tabs defaultValue="templates" className="flex-1 flex flex-col">
          <div className="px-4 pt-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="templates">Library</TabsTrigger>
              <TabsTrigger value="uploads">Uploads</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="templates" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] p-4">
              <div className="grid grid-cols-1 gap-3">
                {fabrics.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onSelectFabric(f)}
                    className={cn(
                      "group relative flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left",
                      selectedFabricId === f.id 
                        ? "border-blue-500 bg-blue-50/50 shadow-sm" 
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform" 
                      style={{ backgroundColor: f.color }} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{f.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{f.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="uploads" className="flex-1 overflow-hidden mt-0">
             <div className="p-4 flex flex-col h-full">
                <Button onClick={onUploadClick} className="w-full mb-4 gap-2 bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4" /> Upload New Fabric
                </Button>
                
                <ScrollArea className="flex-1">
                  {customFabrics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                      <p className="text-sm">No custom fabrics yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pb-4">
                      {customFabrics.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectFabric({ ...f, isCustom: true })}
                          className={cn(
                            "aspect-square rounded-lg border-2 overflow-hidden transition-all",
                            selectedFabricId === f.id ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-100"
                          )}
                        >
                          <img src={f.url} alt="Custom" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
             </div>
          </TabsContent>

          <TabsContent value="edit" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] p-4">
              {controls}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t bg-slate-50/50">
          <Button onClick={onExportPDF} variant="outline" className="w-full gap-2 border-slate-200">
            <FileText className="w-4 h-4" /> Export Technical Sheet
          </Button>
        </div>
      </div>
    </aside>
  </>
  );
}

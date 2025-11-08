'use client';

import { useState, useMemo, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  emojiCategories, 
  lucideCategories, 
  getIconsByCategory, 
  type IconItem, 
  type IconType,
} from '@/lib/utils/icons';
import { Search, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface IconSelectorProps {
  value?: string | LucideIcon;
  onSelect: (value: string | LucideIcon) => void;
  type?: IconType | 'both';
  className?: string;
  trigger?: React.ReactNode;
}

const ITEMS_PER_PAGE = 24;

export function IconSelector({ 
  value, 
  onSelect, 
  type = 'both',
  className,
  trigger 
}: IconSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentType, setCurrentType] = useState<IconType>(type === 'both' ? 'emoji' : type);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});

  // Sync currentType when type prop changes
  useEffect(() => {
    if (type !== 'both') {
      setCurrentType(type);
    }
  }, [type]);

  // Determine which types to show
  const showEmojis = type === 'emoji' || type === 'both';
  const showLucide = type === 'lucide' || type === 'both';

  // Get categories based on current type
  const categories = useMemo(() => {
    if (currentType === 'emoji' && showEmojis) {
      return emojiCategories;
    } else if (currentType === 'lucide' && showLucide) {
      return lucideCategories;
    }
    return [];
  }, [currentType, showEmojis, showLucide]);

  // Set default category when type changes
  useEffect(() => {
    if (categories.length > 0 && !currentCategory) {
      setCurrentCategory(categories[0].id);
    } else if (categories.length > 0 && currentCategory && !categories.find(c => c.id === currentCategory)) {
      // If current category doesn't exist in new type, reset to first category
      setCurrentCategory(categories[0].id);
    }
  }, [categories, currentCategory]);

  // Get icons for current category
  const icons = useMemo(() => {
    if (!currentCategory) return [];
    let categoryIcons = getIconsByCategory(currentCategory, currentType);
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      categoryIcons = categoryIcons.filter(icon => 
        icon.name.toLowerCase().includes(query)
      );
    }
    
    return categoryIcons;
  }, [currentCategory, currentType, searchQuery]);

  // Pagination
  const page = currentPage[currentCategory] || 1;
  const totalPages = Math.ceil(icons.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedIcons = icons.slice(startIndex, endIndex);

  // Reset page when category or search changes
  useEffect(() => {
    if (currentPage[currentCategory] !== 1) {
      setCurrentPage(prev => ({ ...prev, [currentCategory]: 1 }));
    }
  }, [currentCategory, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(prev => ({ ...prev, [currentCategory]: newPage }));
  };

  const handleIconSelect = (icon: IconItem) => {
    onSelect(icon.value);
    setOpen(false);
    setSearchQuery('');
  };

  const renderIcon = (icon: IconItem) => {
    if (icon.type === 'emoji') {
      return (
        <span className="text-2xl" role="img" aria-label={icon.name}>
          {icon.value as string}
        </span>
      );
    } else {
      const IconComponent = icon.value as LucideIcon;
      return <IconComponent className="h-5 w-5" />;
    }
  };

  const renderTrigger = () => {
    if (trigger) return trigger;
    
    // Default trigger showing selected icon or placeholder
    if (value) {
      if (typeof value === 'string') {
        return (
          <Button
            type="button"
            variant="outline"
            className={cn("h-10 w-10 p-0", className)}
            onClick={() => setOpen(!open)}
          >
            <span className="text-xl">{value}</span>
          </Button>
        );
      } else {
        const IconComponent = value;
        return (
          <Button
            type="button"
            variant="outline"
            className={cn("h-10 w-10 p-0", className)}
            onClick={() => setOpen(!open)}
          >
            <IconComponent className="h-5 w-5" />
          </Button>
        );
      }
    }
    
    return (
      <Button
        type="button"
        variant="outline"
        className={cn("h-10 w-10 p-0", className)}
        onClick={() => setOpen(!open)}
      >
        <span className="text-xl">🎨</span>
      </Button>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger()}
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Type selector (if both types are available) */}
          {type === 'both' && (
            <Tabs value={currentType} onValueChange={(v) => {
              setCurrentType(v as IconType);
              setCurrentCategory('');
              setCurrentPage({});
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="emoji">Emojis</TabsTrigger>
                <TabsTrigger value="lucide">Iconos</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar icono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <Tabs value={currentCategory} onValueChange={(v) => {
              setCurrentCategory(v);
              setCurrentPage(prev => ({ ...prev, [v]: 1 }));
            }}>
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="h-10 w-10 p-0 data-[state=active]:bg-background"
                    title={category.name}
                  >
                    {category.type === 'emoji' ? (
                      <span className="text-lg">{category.icon as string}</span>
                    ) : (
                      <span className="flex items-center justify-center">
                        {(() => {
                          const IconComponent = category.icon as LucideIcon;
                          return <IconComponent className="h-4 w-4" />;
                        })()}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Icons grid */}
              <TabsContent value={currentCategory} className="mt-4">
                {paginatedIcons.length > 0 ? (
                  <>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {paginatedIcons.map((icon) => {
                        const isSelected = 
                          (icon.type === 'emoji' && typeof value === 'string' && icon.value === value) ||
                          (icon.type === 'lucide' && typeof value !== 'string' && 
                           typeof icon.value !== 'string' && typeof value !== 'string' &&
                           (icon.value as any).displayName === (value as any).displayName);
                        
                        return (
                          <button
                            key={icon.id}
                            type="button"
                            onClick={() => handleIconSelect(icon)}
                            className={cn(
                              "flex items-center justify-center h-10 w-10 rounded-md border transition-colors hover:bg-accent hover:text-accent-foreground",
                              isSelected && "bg-primary text-primary-foreground border-primary"
                            )}
                            title={icon.name}
                          >
                            {renderIcon(icon)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(Math.max(1, page - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Página {page} de {totalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No se encontraron iconos' : 'No hay iconos disponibles'}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}


"use client";

/**
 * Sidebar, stays custom (Base UI has no sidebar foundation) (Phase 5).
 * asChild composition migrated from Radix Slot to Base UI's `useRender`.
 * Container/border, floating shadow, active pill, hover surface, and group
 * labels use `--primitive-*` tokens. Collapse animation is 240ms and
 * RM-gated via `useReducedMotion`.
 */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRender } from "@base-ui/react/use-render";
import {
  IconChevronRight,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const WENSITY_STYLE_ID = "wensity-sidebar-styles";
const WENSITY_STYLES = `
/* ── Sidebar nav: scrollbar selalu tersembunyi ─────────────── */
.sidebar-nav {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sidebar-nav::-webkit-scrollbar {
  display: none;
}
`;

if (typeof document !== "undefined" && !document.getElementById(WENSITY_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = WENSITY_STYLE_ID;
  style.textContent = WENSITY_STYLES;
  document.head.appendChild(style);
}

/* ─── Motion constants ──────────────────────────────────────── */

const EASE_OUT = [0.23, 1, 0.32, 1];

/* ─── Context ───────────────────────────────────────────────── */

const SidebarContext = React.createContext(null);

function useSidebarContext() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx)
    throw new Error("Sidebar compound components must be used within <Sidebar>");
  return ctx;
}

/**
 * Reads the current sidebar state. Use this to make custom header/footer
 * content (a logo, a workspace switcher) react to the real collapsed state
 * instead of threading a manually-tracked prop through the tree.
 */
export function useSidebar() {
  const { variant, collapsed, toggleCollapsed } = useSidebarContext();
  return { variant, collapsed, toggleCollapsed };
}

/* ─── Resizable width hook ──────────────────────────────────── */

function useResizableWidth(initial, min, max) {
  const [width, setWidth] = React.useState(initial);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragState = React.useRef(null);

  const clamp = React.useCallback(
    (value) => Math.min(max, Math.max(min, value)),
    [min, max],
  );

  const onPointerDown = React.useCallback(
    (e) => {
      e.preventDefault();
      e.target.setPointerCapture(e.pointerId);
      dragState.current = { startX: e.clientX, startWidth: width };
      setIsDragging(true);
    },
    [width],
  );

  React.useEffect(() => {
    if (!isDragging) return undefined;

    const onPointerMove = (e) => {
      if (!dragState.current) return;
      const delta = e.clientX - dragState.current.startX;
      setWidth(clamp(dragState.current.startWidth + delta));
    };

    const onPointerUp = () => {
      dragState.current = null;
      setIsDragging(false);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDragging, clamp]);

  const onKeyDown = React.useCallback(
    (e) => {
      const step = e.shiftKey ? 48 : 16;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setWidth((w) => clamp(w - step));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setWidth((w) => clamp(w + step));
      } else if (e.key === "Home") {
        e.preventDefault();
        setWidth(min);
      } else if (e.key === "End") {
        e.preventDefault();
        setWidth(max);
      }
    },
    [clamp, min, max],
  );

  const reset = React.useCallback(() => setWidth(initial), [initial]);

  return { width, isDragging, onPointerDown, onKeyDown, reset };
}

/* ─── Shared item styling ───────────────────────────────────── */

const itemBaseClasses = cn(
  "group/sidebar-item relative flex w-full items-center gap-2.5 rounded-[var(--primitive-radius-item,0.625rem)] px-3 py-2",
  "text-[13.5px] font-medium leading-[1.45] outline-none select-none whitespace-nowrap",
  "transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
  "focus-visible:ring-2 focus-visible:ring-[color:var(--primitive-ring,color-mix(in_srgb,var(--foreground)_45%,transparent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  "disabled:pointer-events-none disabled:opacity-40",
);

const itemInactiveClasses = cn(
  "text-[color:var(--primitive-text-secondary,color-mix(in_srgb,var(--foreground)_72%,transparent))]",
  "hover:text-[var(--foreground)]",
  "hover:bg-[color:var(--primitive-surface-hover,color-mix(in_srgb,var(--foreground)_4%,transparent))]",
);

const itemActiveClasses = "text-[var(--foreground)]";

const activePillClasses = cn(
  "pointer-events-none absolute inset-0 rounded-[var(--primitive-radius-item,0.625rem)]",
  "bg-[color:var(--primitive-surface-selected,color-mix(in_srgb,var(--foreground)_6%,transparent))]",
);

/* ─── <Sidebar> ─────────────────────────────────────────────── */

export const Sidebar = React.forwardRef(
  (
    {
      variant = "default",
      collapsed: controlledCollapsed,
      defaultCollapsed = false,
      onCollapsedChange,
      width: widthProp = 260,
      collapsedWidth = 60,
      minWidth = 180,
      maxWidth = 400,
      className,
      children,
      "aria-label": ariaLabel = "Sidebar",
      style,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const prefersReducedMotion = useReducedMotion();
    const isCollapsible = variant === "collapsible";
    const isIconRail = variant === "icon-rail";
    const isResizable = variant === "resizable";

    const [internalCollapsed, setInternalCollapsed] =
      React.useState(defaultCollapsed);
    const isControlled = controlledCollapsed !== undefined;
    const collapsed = isIconRail
      ? true
      : isCollapsible
        ? isControlled
          ? controlledCollapsed
          : internalCollapsed
        : false;

    const toggleCollapsed = React.useCallback(() => {
      if (!isCollapsible) return;
      const next = !collapsed;
      if (!isControlled) setInternalCollapsed(next);
      onCollapsedChange?.(next);
    }, [isCollapsible, collapsed, isControlled, onCollapsedChange]);

    const resize = useResizableWidth(widthProp, minWidth, maxWidth);

    const effectiveWidth = collapsed
      ? collapsedWidth
      : isResizable
        ? resize.width
        : widthProp;

    const ctx = React.useMemo(
      () => ({
        variant,
        collapsed,
        toggleCollapsed,
        navId: `sidebar-${reactId}`,
      }),
      [variant, collapsed, toggleCollapsed, reactId],
    );

    return (
      <SidebarContext.Provider value={ctx}>
        <nav
          data-wensity-primitive=""
          ref={ref}
          aria-label={ariaLabel}
          data-slot="sidebar"
          data-variant={variant}
          data-collapsed={collapsed ? "true" : "false"}
          data-dragging={resize.isDragging ? "true" : undefined}
          style={{
            ...style,
            width: effectiveWidth,
            flexShrink: 0,
            transition:
              resize.isDragging || prefersReducedMotion
                ? "none"
                : "width 240ms cubic-bezier(0.23,1,0.32,1)",
          }}
          className={cn(
            "relative isolate flex h-full flex-col overflow-hidden",
            "bg-[var(--background)] text-[var(--foreground)]",
            variant === "floating"
              ? cn(
                  "m-3 h-[calc(100%-1.5rem)] rounded-[var(--primitive-radius-surface,1rem)]",
                  "border border-[var(--border)]",
                  "bg-[color:var(--primitive-surface-elevated,var(--card))]",
                  "[box-shadow:var(--primitive-shadow-raised,0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-12px_rgba(0,0,0,0.12))]",
                )
              : "border-r border-[var(--border)]",
            resize.isDragging && "select-none",
            className,
          )}
          {...props}
        >
          {children}
          {isResizable && (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label="Resize sidebar"
              aria-valuemin={minWidth}
              aria-valuemax={maxWidth}
              aria-valuenow={Math.round(resize.width)}
              data-slot="sidebar-resize-handle"
              onPointerDown={resize.onPointerDown}
              onKeyDown={resize.onKeyDown}
              onDoubleClick={resize.reset}
              className={cn(
                "absolute inset-y-0 right-0 z-20 w-1.5 cursor-col-resize outline-none",
                "after:absolute after:inset-y-0 after:right-0 after:w-[2px]",
                "after:bg-transparent after:transition-colors after:duration-150",
                "hover:after:bg-[color-mix(in_srgb,var(--foreground)_18%,transparent)]",
                "focus-visible:after:bg-[color-mix(in_srgb,var(--foreground)_25%,transparent)]",
                resize.isDragging &&
                  "after:bg-[color-mix(in_srgb,var(--foreground)_30%,transparent)]",
              )}
            />
          )}
        </nav>
      </SidebarContext.Provider>
    );
  },
);
Sidebar.displayName = "Sidebar";

/* ─── Fading label (shared by item / nested / section) ──────── */

function FadingLabel({ show, className, children }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.12,
            ease: EASE_OUT,
          }}
          className={className}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ─── <SidebarHeader> ───────────────────────────────────────── */

export const SidebarHeader = React.forwardRef(
  ({ className, children, onClick, ...props }, ref) => {
    const { collapsed, variant, toggleCollapsed } = useSidebarContext();
    const isCollapsible = variant === "collapsible";

    // Collapsed: drop the separate toggle control (it has no room to render
    // cleanly at rail width) and let the logo itself expand the sidebar.
    const visibleChildren = collapsed
      ? React.Children.toArray(children).filter(
          (child) =>
            !(React.isValidElement(child) && child.type === SidebarToggle),
        )
      : children;

    return (
      <div
        ref={ref}
        data-slot="sidebar-header"
        data-collapsed={collapsed ? "true" : "false"}
        role={collapsed && isCollapsible ? "button" : undefined}
        tabIndex={collapsed && isCollapsible ? 0 : undefined}
        aria-label={collapsed && isCollapsible ? "Expand sidebar" : undefined}
        onClick={(e) => {
          onClick?.(e);
          if (collapsed && isCollapsible) toggleCollapsed();
        }}
        onKeyDown={(e) => {
          if (
            collapsed &&
            isCollapsible &&
            (e.key === "Enter" || e.key === " ")
          ) {
            e.preventDefault();
            toggleCollapsed();
          }
        }}
        className={cn(
          "flex shrink-0 items-center",
          collapsed
            ? cn(
                "flex-col justify-center gap-2 px-0 py-3",
                isCollapsible &&
                  cn(
                    "cursor-pointer select-none outline-none rounded-[var(--primitive-radius-item,0.625rem)]",
                    "[transition:background-color_150ms_cubic-bezier(0.23,1,0.32,1),transform_120ms_cubic-bezier(0.23,1,0.32,1)]",
                    "hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]",
                    "focus-visible:ring-2 focus-visible:ring-[color:var(--primitive-ring,color-mix(in_srgb,var(--foreground)_45%,transparent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                    "active:[transform:scale(0.97)]",
                    "motion-reduce:active:[transform:none]",
                  ),
              )
            : "min-h-[56px] gap-2.5 px-4 py-2.5",
          className,
        )}
        {...props}
      >
        {visibleChildren}
      </div>
    );
  },
);
SidebarHeader.displayName = "SidebarHeader";

/* ─── <SidebarNav> ──────────────────────────────────────────── */

export const SidebarNav = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { navId } = useSidebarContext();
    return (
      <div
        ref={ref}
        id={navId}
        data-slot="sidebar-nav"
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain py-2",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SidebarNav.displayName = "SidebarNav";

/* ─── <SidebarSection> ──────────────────────────────────────── */

export const SidebarSection = React.forwardRef(
  ({ className, label, children, ...props }, ref) => {
    const { collapsed } = useSidebarContext();
    return (
      <div
        ref={ref}
        data-slot="sidebar-section"
        role="group"
        aria-label={label}
        className={cn("py-1", className)}
        {...props}
      >
        {label && (
          <div className="flex min-h-[26px] items-end px-4 pt-1 pb-1.5">
            <FadingLabel
              show={!collapsed}
              className={cn(
                "text-[10.5px] font-medium uppercase leading-snug tracking-[0.08em]",
                "text-[var(--muted-foreground)] whitespace-nowrap",
              )}
            >
              {label}
            </FadingLabel>
          </div>
        )}
        <div className="flex flex-col gap-px px-2">{children}</div>
      </div>
    );
  },
);
SidebarSection.displayName = "SidebarSection";

/* ─── Active pill (glides between items) ────────────────────── */

function ActivePill({ navId }) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) {
    return <span aria-hidden="true" className={activePillClasses} />;
  }
  return (
    <motion.span
      aria-hidden="true"
      layoutId={`${navId}-active-pill`}
      transition={{ type: "spring", stiffness: 520, damping: 42 }}
      className={activePillClasses}
    />
  );
}

/* ─── <SidebarItem> ─────────────────────────────────────────── */

export const SidebarItem = React.forwardRef(
  (
    {
      className,
      icon,
      active = false,
      href,
      external = false,
      badge,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const { collapsed, navId } = useSidebarContext();
    const composedClassName = cn(
      itemBaseClasses,
      collapsed && "justify-center px-0 gap-0",
      active ? itemActiveClasses : itemInactiveClasses,
      className,
    );
    const title =
      collapsed && typeof children === "string" ? children : undefined;

    const asChildElement =
      asChild && React.isValidElement(children) ? children : null;

    const asChildRendered = useRender({
      enabled: Boolean(asChildElement),
      ref,
      render: asChildElement ?? undefined,
      props: {
        "data-slot": "sidebar-item",
        "data-active": active ? "true" : undefined,
        "aria-current": active ? "page" : undefined,
        title,
        className: composedClassName,
        ...props,
      },
    });

    if (asChildRendered) return asChildRendered;

    const content = (
      <>
        {active ? <ActivePill navId={navId} /> : null}
        {icon ? (
          <span
            data-slot="sidebar-item-icon"
            className={cn(
              "relative z-10 flex size-5 shrink-0 items-center justify-center",
              active
                ? "text-[var(--primary,var(--foreground))]"
                : "text-[var(--muted-foreground)] transition-colors duration-150 group-hover/sidebar-item:text-[var(--foreground)]",
            )}
          >
            {icon}
          </span>
        ) : null}
        <FadingLabel
          show={!collapsed}
          className="relative z-10 min-w-0 flex-1 truncate py-[1px] text-left"
        >
          {children}
        </FadingLabel>
        {badge ? (
          <FadingLabel
            show={!collapsed}
            className="relative z-10 flex shrink-0 items-center"
          >
            {badge}
          </FadingLabel>
        ) : null}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref}
          data-slot="sidebar-item"
          data-active={active ? "true" : undefined}
          aria-current={active ? "page" : undefined}
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          title={title}
          className={composedClassName}
          {...props}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        data-slot="sidebar-item"
        data-active={active ? "true" : undefined}
        aria-current={active ? "page" : undefined}
        disabled={disabled}
        title={title}
        className={composedClassName}
        {...props}
      >
        {content}
      </button>
    );
  },
);
SidebarItem.displayName = "SidebarItem";

/* ─── <SidebarNested> ───────────────────────────────────────── */

export const SidebarNested = React.forwardRef(
  (
    {
      icon,
      label,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      active = false,
      children,
    },
    ref,
  ) => {
    const { collapsed } = useSidebarContext();
    const prefersReducedMotion = useReducedMotion();
    const reactId = React.useId();

    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const toggle = React.useCallback(() => {
      const next = !open;
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    }, [open, isControlled, onOpenChange]);

    const contentId = `sidebar-nested-content-${reactId}`;

    return (
      <div ref={ref} data-slot="sidebar-nested" className="flex flex-col">
        <button
          type="button"
          data-slot="sidebar-nested-trigger"
          data-open={open ? "true" : "false"}
          data-active={active ? "true" : undefined}
          aria-expanded={open}
          aria-controls={contentId}
          onClick={toggle}
          title={collapsed ? label : undefined}
          className={cn(
            itemBaseClasses,
            collapsed && "justify-center px-0 gap-0",
            active && collapsed ? itemActiveClasses : itemInactiveClasses,
          )}
        >
          {active && collapsed && (
            <span aria-hidden="true" className={activePillClasses} />
          )}
          {icon && (
            <span
              data-slot="sidebar-nested-icon"
              className={cn(
                "relative z-10 flex size-5 shrink-0 items-center justify-center",
                "text-[var(--muted-foreground)] group-hover/sidebar-item:text-[var(--foreground)] transition-colors duration-150",
              )}
            >
              {icon}
            </span>
          )}
          <FadingLabel
            show={!collapsed}
            className="relative z-10 min-w-0 flex-1 truncate py-[1px] text-left"
          >
            {label}
          </FadingLabel>
          <FadingLabel
            show={!collapsed}
            className="relative z-10 flex shrink-0 items-center"
          >
            <motion.span
              aria-hidden="true"
              animate={{ rotate: open ? 90 : 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.2,
                ease: EASE_OUT,
              }}
              className="flex items-center justify-center text-[var(--muted-foreground)]"
            >
              <IconChevronRight className="size-3.5" stroke={2} />
            </motion.span>
          </FadingLabel>
        </button>
        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.div
              id={contentId}
              data-slot="sidebar-nested-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: {
                  duration: prefersReducedMotion ? 0 : 0.24,
                  ease: EASE_OUT,
                },
                opacity: {
                  duration: prefersReducedMotion ? 0 : 0.16,
                  ease: EASE_OUT,
                },
              }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "relative ml-[21px] flex flex-col gap-px py-0.5 pl-2.5",
                  "before:absolute before:inset-y-1 before:left-0 before:w-px",
                  "before:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)]",
                )}
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
SidebarNested.displayName = "SidebarNested";

/* ─── <SidebarFooter> ───────────────────────────────────────── */

export const SidebarFooter = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { collapsed } = useSidebarContext();
    return (
      <div
        ref={ref}
        data-slot="sidebar-footer"
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "flex shrink-0 items-center py-3",
          "border-t border-[var(--border)]",
          collapsed ? "justify-center px-2" : "gap-2.5 px-4",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
SidebarFooter.displayName = "SidebarFooter";

/* ─── <SidebarToggle> ───────────────────────────────────────── */

export const SidebarToggle = React.forwardRef(
  (
    { className, children, collapsed: collapsedProp, onToggle, ...props },
    ref,
  ) => {
    const ctx = React.useContext(SidebarContext);
    const usesContext = ctx?.variant === "collapsible";

    const collapsed = usesContext ? ctx.collapsed : collapsedProp;
    const toggle = usesContext ? ctx.toggleCollapsed : onToggle;

    if (collapsed === undefined || !toggle) return null;

    return (
      <button
        ref={ref}
        type="button"
        data-slot="sidebar-toggle"
        data-collapsed={collapsed ? "true" : "false"}
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-[var(--primitive-radius-control-sm,0.625rem)] outline-none",
          "text-[var(--muted-foreground)]",
          "hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hover:text-[var(--foreground)]",
          "focus-visible:ring-2 focus-visible:ring-[color:var(--primitive-ring,color-mix(in_srgb,var(--foreground)_45%,transparent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          "[transition:transform_120ms_cubic-bezier(0.23,1,0.32,1),color_150ms_ease,background-color_150ms_ease]",
          "active:[transform:scale(0.96)]",
          "motion-reduce:active:[transform:none]",
          className,
        )}
        {...props}
      >
        {typeof children === "function" ? (
          children({ collapsed })
        ) : (
          children ??
          (collapsed ? (
            <IconLayoutSidebarLeftExpand
              className="size-[17px]"
              stroke={1.75}
            />
          ) : (
            <IconLayoutSidebarLeftCollapse
              className="size-[17px]"
              stroke={1.75}
            />
          ))
        )}
      </button>
    );
  },
);
SidebarToggle.displayName = "SidebarToggle";

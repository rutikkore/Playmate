export const matchKeys = {
  all: ["matches"] as const,
  lists: () => [...matchKeys.all, "list"] as const,
  list: (filters: any) => [...matchKeys.lists(), { filters }] as const,
  details: () => [...matchKeys.all, "detail"] as const,
  detail: (id: string) => [...matchKeys.details(), id] as const,
  hosted: () => [...matchKeys.all, "hosted"] as const,
  joined: () => [...matchKeys.all, "joined"] as const,
};

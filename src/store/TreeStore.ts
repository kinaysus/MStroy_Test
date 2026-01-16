export interface TreeItem {
  id: string | number
  parent: string | number | null
  [key: string]: any
}

export class TreeStore<T extends TreeItem> {
  private items: T[]
  private itemsMap = new Map<T['id'], T>()
  private childrenMap = new Map<T['id'] | null, T[]>()

  constructor(items: T[]) {
    this.items = [...items]

    for (const item of items) {
      this.itemsMap.set(item.id, item)

      const parentKey = item.parent ?? null
      if (!this.childrenMap.has(parentKey)) {
        this.childrenMap.set(parentKey, [])
      }
      this.childrenMap.get(parentKey)!.push(item)
    }
  }

  getAll(): T[] {
    return this.items
  }

  getItem(id: T['id']): T | undefined {
    return this.itemsMap.get(id)
  }

  getChildren(id: T['id']): T[] {
    return this.childrenMap.get(id) ?? []
  }

  getAllChildren(id: T['id']): T[] {
    const result: T[] = []
    const stack = [...this.getChildren(id)]

    while (stack.length) {
      const item = stack.pop()!
      result.push(item)

      const children = this.getChildren(item.id)
      if (children.length) {
        stack.push(...children)
      }
    }

    return result
  }

  getAllParents(id: T['id']): T[] {
    const result: T[] = []
    let current = this.getItem(id)

    while (current) {
      result.push(current)
      current = current.parent !== null
        ? this.getItem(current.parent)
        : undefined
    }

    return result
  }

  addItem(item: T): void {
    this.items.push(item)
    this.itemsMap.set(item.id, item)

    const parentKey = item.parent ?? null
    if (!this.childrenMap.has(parentKey)) {
      this.childrenMap.set(parentKey, [])
    }
    this.childrenMap.get(parentKey)!.push(item)
  }

  updateItem(updated: T): void {
    const existing = this.itemsMap.get(updated.id)
    if (!existing) return

    // обработка изменений родителя
    if (existing.parent !== updated.parent) {
      const oldParent = existing.parent ?? null
      const newParent = updated.parent ?? null

      this.childrenMap.set(
        oldParent,
        (this.childrenMap.get(oldParent) ?? []).filter(i => i.id !== updated.id)
      )

      if (!this.childrenMap.has(newParent)) {
        this.childrenMap.set(newParent, [])
      }
      this.childrenMap.get(newParent)!.push(updated)
    }

    Object.assign(existing, updated)
  }

  removeItem(id: T['id']): void {
    const toRemove = [id, ...this.getAllChildren(id).map(i => i.id)]

    for (const removeId of toRemove) {
      const item = this.itemsMap.get(removeId)
      if (!item) continue

      const parentKey = item.parent ?? null
      this.childrenMap.set(
        parentKey,
        (this.childrenMap.get(parentKey) ?? []).filter(i => i.id !== removeId)
      )

      this.itemsMap.delete(removeId)
    }

    this.items = this.items.filter(i => !toRemove.includes(i.id))
  }
}

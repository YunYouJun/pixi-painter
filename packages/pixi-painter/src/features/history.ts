export interface PainterAction {
  undo(): void
  redo(): void
}

export class PainterHistory {
  undoStack: PainterAction[] = []
  redoStack: PainterAction[] = []

  record(action: PainterAction) {
    this.undoStack.push(action)
    this.redoStack.length = 0
  }

  undo() {
    const action = this.undoStack.pop()
    if (action) {
      action.undo()
      this.redoStack.push(action)
    }
  }

  redo() {
    const action = this.redoStack.pop()
    if (action) {
      action.redo()
      this.undoStack.push(action)
    }
  }
}

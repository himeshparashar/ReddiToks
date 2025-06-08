export interface DialogueLine {
  speaker: string;
  text: string;
  audioFilePath: string;
  startTime: number;
  duration: number;
}

export interface Script {
  id: string;
  lines: DialogueLine[];
  background: string;
  characters: string[];
}

export class ScriptEntity {
  constructor(
    public readonly id: string,
    public readonly lines: DialogueLine[],
    public readonly background: string,
    public readonly characters: string[]
  ) {}

  static create(data: Omit<Script, "id">): ScriptEntity {
    const id = this.generateId();
    return new ScriptEntity(id, data.lines, data.background, data.characters);
  }

  private static generateId(): string {
    return `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addDialogueLine(line: DialogueLine): ScriptEntity {
    return new ScriptEntity(
      this.id,
      [...this.lines, line],
      this.background,
      this.characters
    );
  }

  updateAudioPath(lineIndex: number, audioFilePath: string): ScriptEntity {
    const updatedLines = this.lines.map((line, index) =>
      index === lineIndex ? { ...line, audioFilePath } : line
    );

    return new ScriptEntity(
      this.id,
      updatedLines,
      this.background,
      this.characters
    );
  }
}

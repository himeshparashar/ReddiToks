export class Dialogue {
  constructor(
    public readonly speaker: string,
    public readonly text: string,
    public readonly timestamp?: number
  ) {
    this.validateText();
    this.validateSpeaker();
  }

  private validateText(): void {
    if (!this.text || this.text.trim().length === 0) {
      throw new Error("Dialogue text cannot be empty");
    }
  }

  private validateSpeaker(): void {
    if (!this.speaker || this.speaker.trim().length === 0) {
      throw new Error("Speaker name cannot be empty");
    }
  }

  getWordCount(): number {
    return this.text.trim().split(/\s+/).length;
  }

  estimateDuration(wordsPerMinute: number = 150): number {
    return (this.getWordCount() / wordsPerMinute) * 60; // in seconds
  }

  toPlainText(): string {
    return `${this.speaker}: ${this.text}`;
  }
}

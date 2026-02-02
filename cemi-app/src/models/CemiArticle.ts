export class CemiArticle {
  
  private media: CemiMedia[];

  private _mainText: string;
  private _mainUrlAudio: string;

  private _alternativeText: string | undefined;
  private _alternativeUrlAudio: string | undefined;
  private _secondaryText: string | undefined;
  private _secondaryUrlAudio: string | undefined;

  private _selecetedMedia: CemiMedia | undefined;
  private _selecetedMediaIndex: number | undefined;
  
  private _keywords: string[];

  constructor(public id: string, public title: string, text: string, urlAudio: string) {
      this.media = []
      this._mainText = text;
      this._mainUrlAudio = urlAudio;
      this._keywords = [];
  }

  public addAlternativeText(text: string, urlAudio: string) {
      this._alternativeText = text;
      this._alternativeUrlAudio = urlAudio;
  }

  public addSecondaryText(text: string, urlAudio: string) {
      this._secondaryText = text;
      this._secondaryUrlAudio = urlAudio;
  }

  public addImage(title: string, url: string, desc: string) {
    this.media.push(new CemiImage(title, url, desc));
  }

  public addVideo(title: string, url: string, subUrl: string) {
    this.media.push(new CemiVideo(title, url, subUrl));
  }

  public addKeyword(keyword: string) {
    this._keywords.push(keyword);
  }

  public getText(isAlternative?: boolean) {
    return isAlternative ? (this._alternativeText ? this._alternativeText : this._mainText) : this._mainText;
  }

  public getSecondaryText() {
      return this._secondaryText;
  }

  public getUrlAudio(isAlternative?: boolean) {
    return isAlternative ? this._alternativeUrlAudio ? this._alternativeUrlAudio : null : this._mainUrlAudio;
  }

  public getSecondaryUrlAudio() {
      return this._secondaryUrlAudio ? this._secondaryUrlAudio : null;
  }

  public hasSecondaryText(): boolean {
    if(this._secondaryText)
      return true;
    return false;
  }

  public setSelectedMedia(index: number) {
    this._selecetedMedia = this.media[index];
  }

  public getSelectedMedia(): CemiMedia | undefined {
    return this._selecetedMedia;
  }

  public setSelectedMediaIndex(index: number) {
    this._selecetedMediaIndex = index;
  }

  public getSelectedMediaIndex(): number | undefined {
    return this._selecetedMediaIndex;
  }

  public hasKeywords(): boolean {
    return this._keywords.length > 0;
  }

  public getKeywords(): string[] {
    return this._keywords;
  }

}

export class CemiArticleLink {
  constructor(public id: string, public title: string) {}
}

export class CemiMedia {

  private _thumbUrl: string;

  isImage(): this is CemiImage {
    return this instanceof CemiImage;
  }
  isVideo(): this is CemiVideo {
    return this instanceof CemiVideo;
  }
  constructor(public title: string, public url: string) {
    const filename = url.split("/").pop()!;
    this._thumbUrl = "/data/media/images/thumbs/"+filename.replace(/(\.[^/.]+)$/, "-thumb.jpg");
  }

  get thumbUrl() { return this._thumbUrl; }
  
}

export class CemiImage extends CemiMedia {
  constructor(title: string, url: string, public desc: string) {
    super(title, url);
  }
}

export class CemiVideo extends CemiMedia {
  constructor(title: string, url: string, public subUrl: string) {
    super(title, url);
  }
}
import { CemiArticle } from "./CemiArticle";

export class CemiContent {

    private _title: string;
    private _subtitle: string;
    private _articles: CemiArticle[];
    private _creditsTitle: string;
    private _credits: CemiCredit[];
    private _bibliographyTitle: string;
    private _bibliography: string[];

    constructor() {
        this._title = "";
        this._subtitle = "";
        this._articles = [];
        this._creditsTitle = "";
        this._credits = [];
        this._bibliographyTitle = "";
        this._bibliography = [];
    }

    public get title() { return this._title; }
    public set title(title: string) { 
        if (title)
        this._title = title;
    }

    public get subtitle() { return this._subtitle; }
    public set subtitle(subtitle: string) {
        if (subtitle)
            this._subtitle = subtitle;
    }

    public get articles() { return this._articles; }
    public set articles(articles: CemiArticle[]) {
        if (articles)
            this._articles = articles;
    }

    public get creditsTitle() { return this._creditsTitle; }
    public set creditsTitle(creditsTitle: string) {
        if (creditsTitle)
            this._creditsTitle = creditsTitle;
    }

    public get credits() { return this._credits; }
    public set credits(credits: CemiCredit[]) {
        if (credits)
            this._credits = credits;
    }

    public get bibliographyTitle() { return this._bibliographyTitle; }
    public set bibliographyTitle(bibliographyTitle: string) {
        if (bibliographyTitle)
            this._bibliographyTitle = bibliographyTitle;
    }

    public get bibliography() { return this._bibliography; }
    public set bibliography(bibliography: string[]) {
        if (bibliography)
            this._bibliography = bibliography;
    }

    public getArticle(id: string): CemiArticle | undefined {
        return this.articles.find(article => article.id == id);
    }

}

export class CemiCredit {
  constructor(public area: string, public contributors: string[]) {}
}
import { CemiArticle } from "../models/CemiArticle";
import { CemiContent, CemiCredit } from "../models/CemiContent";

export class CemiContentService {

    private _media: Media[];
    
    constructor(){
        this._media = [];
    }

    async loadContent(lang: string): Promise<CemiContent> {
        console.log("loading articles.....");
        let uri = "assets/config_json/it/config_json.json"
        if(lang) {
            uri = "assets/config_json/" + lang + "/config_json.json";
        }

        try {
            const response = await fetch(uri);
            const value: TazResponse = await response.json();
            console.log("content service response received");

            let content = new CemiContent();
            content.title = value.title;
            content.subtitle = value.subtitle;
            content.creditsTitle = value.credits.title;
            content.credits = value.credits.items.map(element => new CemiCredit(element.area, element.contributors));
            content.bibliographyTitle = value.bibliography.title;
            content.bibliography = value.bibliography.items;

            // articles
            this._media = [];
            value.media.speeches.forEach((element) => {
                this._media.push(element);
            });
            value.media.images.forEach((element) => {
                this._media.push(element);
            });
            value.media.videos.forEach((element) => {
                this._media.push(element);
            });
            value.media.subtitles.forEach((element) => {
                this._media.push(element);
            });
            content.articles = value.articles.map(element => this.transformToCemiArticle(element));

            console.log("Cemi content created");
            return content;
        }
        catch (error) {
            console.error('Error loading Cemi content:', error);
            return new CemiContent();
        }
    }

    private transformToCemiArticle(article: Article) : CemiArticle {
        let audioTN1Loaded = this._getMedia(article.audioTN1Id);
        let cemiArticle = new CemiArticle(article.id, article.title, article.TN1, audioTN1Loaded ? audioTN1Loaded.url : ""); // TODO
       
        let audioTALoaded = this._getMedia(article.audioTAId);
        cemiArticle.addAlternativeText(article.TA, audioTALoaded ? audioTALoaded.url : "");
        
        let audioTN2Loaded = this._getMedia(article.audioTN2Id);
        cemiArticle.addSecondaryText(article.TN2, audioTN2Loaded ? audioTN2Loaded.url : "");
            
        if(article.mediaList) {
            article.mediaList.forEach((media) => {
                let mediaLoaded = this._getMedia(media.id);
                if(mediaLoaded) {
                    if(media.type == "image") {
                        cemiArticle.addImage("", mediaLoaded.url, media.desc);
                    }
                    else if(media.type == "video") {
                        let subLoaded = this._getMedia(media.subId);
                        cemiArticle.addVideo("", mediaLoaded.url, subLoaded ? subLoaded.url : "");
                    }
                }
            });
        }
        if(article.keywords) {
            article.keywords.forEach((keyword) => cemiArticle.addKeyword(keyword));
        }
        return cemiArticle;
    }

    private _getMedia(id: string): Media | undefined {
        return this._media.find(media => media.id == id);
    }
}

interface TazResponse {
    title: string;
    subtitle: string;
    articles: Article[];
    credits: {
        title: string;
        items: Credit[];
    },
    bibliography: {
        title: string;
        items: string[];
    },
    media: {
        speeches: Media[];
        images: Media[];
        videos: Media[];
        subtitles: Media[];
    }
}

interface Article {
    id: string;
    title: string;
    TN1: string;
    TN2: string;
    TA: string;
    audioTN1Id: string;
    audioTN2Id: string;
    audioTAId: string;
    mediaList: ArticleMedia[];
    keywords: string[];
}

interface ArticleMedia {
    id: string; 
    type:string; 
    desc: string;
    thumbId: string;
    subId: string;
}

interface Media {
    id: string;
    url: string;
}

interface Credit {
    area: string;
    contributors: string[];
}
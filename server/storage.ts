import { users, images, type User, type InsertUser, type Image, type InsertImage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getImage(id: number): Promise<Image | undefined>;
  getAllImages(): Promise<Image[]>;
  searchImages(query: string): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private images: Map<number, Image>;
  currentUserId: number;
  currentImageId: number;

  constructor() {
    this.users = new Map();
    this.images = new Map();
    this.currentUserId = 1;
    this.currentImageId = 1;
    
    // Initialize with sample images
    this.initializeSampleImages();
  }

  private async initializeSampleImages() {
    const sampleImages: InsertImage[] = [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "John Smith - 2023",
        tags: ["john", "smith", "2023", "johnsmith", "johnsmith2023"]
      },
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "Mary Johnson - 2022",
        tags: ["mary", "johnson", "2022", "maryjohnson", "maryjohnson2022"]
      },
      {
        url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "David Wilson - 2021",
        tags: ["david", "wilson", "2021", "davidwilson", "davidwilson2021"]
      },
      {
        url: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "Sarah Brown - 2024",
        tags: ["sarah", "brown", "2024", "sarahbrown", "sarahbrown2024"]
      },
      {
        url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "Michael Davis - 2020",
        tags: ["michael", "davis", "2020", "michaeldavis", "michaeldavis2020"]
      },
      {
        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "Jennifer Garcia - 2019",
        tags: ["jennifer", "garcia", "2019", "jennifergarcia", "jennifergarcia2019"]
      },
      {
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "Robert Miller - 2023",
        tags: ["robert", "miller", "2023", "robertmiller", "robertmiller2023"]
      },
      {
        url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "Lisa Anderson - 2022",
        tags: ["lisa", "anderson", "2022", "lisaanderson", "lisaanderson2022"]
      },
      {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "James Taylor - 2021",
        tags: ["james", "taylor", "2021", "jamestaylor", "jamestaylor2021"]
      },
      {
        url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        alt: "Emily Thomas - 2024",
        tags: ["emily", "thomas", "2024", "emilythomas", "emilythomas2024"]
      }
    ];

    for (const imageData of sampleImages) {
      await this.createImage(imageData);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getImage(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async getAllImages(): Promise<Image[]> {
    return Array.from(this.images.values());
  }

  async searchImages(query: string): Promise<Image[]> {
    if (!query.trim()) {
      return Array.from(this.images.values()).slice(0, 8);
    }

    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 0);
    const allImages = Array.from(this.images.values());

    const scoredImages = allImages.map(image => {
      let score = 0;
      const allText = [...image.tags, image.alt].join(' ').toLowerCase();

      queryWords.forEach(word => {
        // Exact tag match gets highest score
        if (image.tags.some(tag => tag.toLowerCase() === word)) {
          score += 10;
        }
        // Partial tag match
        else if (image.tags.some(tag => tag.toLowerCase().includes(word))) {
          score += 5;
        }
        // Alt text match
        else if (image.alt.toLowerCase().includes(word)) {
          score += 3;
        }
        // Any text match
        else if (allText.includes(word)) {
          score += 1;
        }
      });

      return { image, score };
    });

    return scoredImages
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.image);
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.currentImageId++;
    const image: Image = { ...insertImage, id };
    this.images.set(id, image);
    return image;
  }
}

export const storage = new MemStorage();

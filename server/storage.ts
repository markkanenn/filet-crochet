import { users, images, digitPatterns, type User, type InsertUser, type Image, type InsertImage, type DigitPattern, type InsertDigitPattern } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getImage(id: number): Promise<Image | undefined>;
  getAllImages(): Promise<Image[]>;
  searchImages(query: string): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
  generatePattern(digits: string, patternSetId?: number, gauge?: { stitchesPerInch: number; rowsPerInch: number }): Promise<Image>;
  
  getDigitPattern(id: number): Promise<DigitPattern | undefined>;
  getAllDigitPatterns(): Promise<DigitPattern[]>;
  getDigitPatternsBySet(isDefault: boolean): Promise<DigitPattern[]>;
  createDigitPattern(pattern: InsertDigitPattern): Promise<DigitPattern>;
  deleteDigitPattern(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private images: Map<number, Image>;
  private digitPatterns: Map<number, DigitPattern>;
  currentUserId: number;
  currentImageId: number;
  currentDigitPatternId: number;

  constructor() {
    this.users = new Map();
    this.images = new Map();
    this.digitPatterns = new Map();
    this.currentUserId = 1;
    this.currentImageId = 1;
    this.currentDigitPatternId = 1;
    
    // Initialize with default digit patterns and sample images
    this.initializeDefaultDigitPatterns().then(() => {
      this.initializeSampleImages();
    });
  }

  private generateDigitPattern(digit: string): string {
    // Generate SVG pattern for filet crochet - black squares represent solid stitches, white squares represent open spaces
    const patterns: { [key: string]: string[][] } = {
      '0': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '1': [
        ['░','░','█','░','░'],
        ['░','█','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['█','█','█','█','█']
      ],
      '2': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█']
      ],
      '3': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '4': [
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█']
      ],
      '5': [
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '6': [
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '7': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['░','░','░','█','░'],
        ['░','░','█','░','░'],
        ['░','█','░','░','░'],
        ['█','░','░','░','░']
      ],
      '8': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '9': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ]
    };

    const pattern = patterns[digit] || patterns['0'];
    const cellSize = 20;
    const width = pattern[0].length * cellSize;
    const height = pattern.length * cellSize;

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        const x = col * cellSize;
        const y = row * cellSize;
        const fill = pattern[row][col] === '█' ? '#000000' : '#ffffff';
        const stroke = '#cccccc';
        
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
      }
    }
    
    svg += '</svg>';
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  private async initializeDefaultDigitPatterns() {
    const defaultPatterns = {
      '0': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '1': [
        ['░','░','█','░','░'],
        ['░','█','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['█','█','█','█','█']
      ],
      '2': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█']
      ],
      '3': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '4': [
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█']
      ],
      '5': [
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '6': [
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '7': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['░','░','░','█','░'],
        ['░','░','█','░','░'],
        ['░','█','░','░','░'],
        ['█','░','░','░','░']
      ],
      '8': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '9': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ]
    };

    for (const [digit, pattern] of Object.entries(defaultPatterns)) {
      await this.createDigitPattern({
        name: `Default ${digit}`,
        description: `Default filet crochet pattern for digit ${digit}`,
        digit: digit,
        pattern: JSON.stringify(pattern),
        width: 5,
        height: 7,
        isDefault: true
      });
    }
  }

  private async initializeSampleImages() {
    const sampleImages: InsertImage[] = [];
    
    // Create individual digit patterns
    for (let i = 0; i <= 9; i++) {
      const digit = i.toString();
      const pattern = this.generateDigitPattern(digit);
      sampleImages.push({
        url: pattern,
        alt: `Filet crochet pattern for digit ${digit}`,
        tags: [digit, `digit${digit}`, 'filet', 'crochet', 'pattern']
      });
    }

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

  // Digit pattern management methods
  async getDigitPattern(id: number): Promise<DigitPattern | undefined> {
    return this.digitPatterns.get(id);
  }

  async getAllDigitPatterns(): Promise<DigitPattern[]> {
    return Array.from(this.digitPatterns.values());
  }

  async getDigitPatternsBySet(isDefault: boolean): Promise<DigitPattern[]> {
    return Array.from(this.digitPatterns.values()).filter(pattern => pattern.isDefault === isDefault);
  }

  async createDigitPattern(insertPattern: InsertDigitPattern): Promise<DigitPattern> {
    const id = this.currentDigitPatternId++;
    const pattern: DigitPattern = { 
      id,
      name: insertPattern.name,
      description: insertPattern.description ?? null,
      digit: insertPattern.digit,
      pattern: insertPattern.pattern,
      width: insertPattern.width,
      height: insertPattern.height,
      isDefault: insertPattern.isDefault ?? false
    };
    this.digitPatterns.set(id, pattern);
    return pattern;
  }

  async deleteDigitPattern(id: number): Promise<boolean> {
    return this.digitPatterns.delete(id);
  }

  async generatePattern(digits: string, patternSetId?: number, gauge?: { stitchesPerInch: number; rowsPerInch: number }): Promise<Image> {
    // Only allow numeric digits
    const cleanDigits = digits.replace(/[^0-9]/g, '');
    if (!cleanDigits) {
      throw new Error('No valid digits provided');
    }

    // Get patterns to use (custom or default)
    const patterns = patternSetId ? 
      await this.getCustomDigitPatterns(patternSetId) : 
      await this.getDigitPatternsBySet(true);

    // Generate combined pattern with gauge adjustment
    const combinedPattern = this.generateCombinedPatternFromCustom(cleanDigits, patterns, gauge);
    
    const image: Image = {
      id: this.currentImageId++,
      url: combinedPattern,
      alt: `Filet crochet pattern for "${cleanDigits}"`,
      tags: [cleanDigits, 'combined', 'filet', 'crochet', 'pattern', ...cleanDigits.split('')]
    };

    this.images.set(image.id, image);
    return image;
  }

  private async getCustomDigitPatterns(patternSetId: number): Promise<DigitPattern[]> {
    // For simplicity, return all non-default patterns
    // In a real app, you'd filter by pattern set ID
    return this.getDigitPatternsBySet(false);
  }

  private generateCombinedPatternFromCustom(
    digits: string, 
    patterns: DigitPattern[], 
    gauge?: { stitchesPerInch: number; rowsPerInch: number }
  ): string {
    // Create a map of digit to pattern for quick lookup
    const patternMap: { [key: string]: string[][] } = {};
    
    for (const pattern of patterns) {
      patternMap[pattern.digit] = JSON.parse(pattern.pattern);
    }
    
    // Fall back to default patterns if custom ones are missing
    const defaultPatterns = this.getDefaultPatterns();
    
    // Combine patterns horizontally with spacing
    const digitPatterns = digits.split('').map(digit => 
      patternMap[digit] || defaultPatterns[digit] || defaultPatterns['0']
    );
    
    let baseHeight = Math.max(...digitPatterns.map(p => p.length));
    let baseDigitWidth = Math.max(...digitPatterns.map(p => p[0] ? p[0].length : 5));
    const spacing = 1;
    
    // Apply gauge scaling if provided
    let scaleX = 1;
    let scaleY = 1;
    
    if (gauge) {
      // Standard gauge is typically 4 stitches per inch
      const standardStitchesPerInch = 4;
      const standardRowsPerInch = 4;
      
      scaleX = Math.round(gauge.stitchesPerInch / standardStitchesPerInch);
      scaleY = Math.round(gauge.rowsPerInch / standardRowsPerInch);
      
      // Ensure minimum scale of 1
      scaleX = Math.max(1, scaleX);
      scaleY = Math.max(1, scaleY);
    }
    
    const scaledHeight = baseHeight * scaleY;
    const scaledDigitWidth = baseDigitWidth * scaleX;
    const totalWidth = digitPatterns.length * scaledDigitWidth + (digitPatterns.length - 1) * spacing * scaleX;
    
    const combinedPattern: string[][] = [];
    
    for (let row = 0; row < scaledHeight; row++) {
      const combinedRow: string[] = [];
      
      for (let digitIndex = 0; digitIndex < digitPatterns.length; digitIndex++) {
        const digitPattern = digitPatterns[digitIndex];
        const sourceRow = Math.floor(row / scaleY);
        
        // Add scaled digit pattern
        for (let col = 0; col < scaledDigitWidth; col++) {
          const sourceCol = Math.floor(col / scaleX);
          const cell = digitPattern[sourceRow] && digitPattern[sourceRow][sourceCol] 
            ? digitPattern[sourceRow][sourceCol] 
            : '░';
          combinedRow.push(cell);
        }
        
        // Add spacing between digits (except after last digit)
        if (digitIndex < digitPatterns.length - 1) {
          for (let s = 0; s < spacing * scaleX; s++) {
            combinedRow.push('░');
          }
        }
      }
      
      combinedPattern.push(combinedRow);
    }

    // Generate SVG with gauge information
    const cellSize = 20;
    const width = totalWidth * cellSize;
    const svgHeight = scaledHeight * cellSize;

    let svg = `<svg width="${width}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    for (let row = 0; row < combinedPattern.length; row++) {
      for (let col = 0; col < combinedPattern[row].length; col++) {
        const x = col * cellSize;
        const y = row * cellSize;
        const fill = combinedPattern[row][col] === '█' ? '#000000' : '#ffffff';
        const stroke = '#cccccc';
        
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
      }
    }
    
    svg += '</svg>';
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }

  private getDefaultPatterns(): { [key: string]: string[][] } {
    return {
      '0': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '1': [
        ['░','░','█','░','░'],
        ['░','█','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['█','█','█','█','█']
      ],
      '2': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█']
      ],
      '3': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '4': [
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█']
      ],
      '5': [
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '6': [
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '7': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['░','░','░','█','░'],
        ['░','░','█','░','░'],
        ['░','█','░','░','░'],
        ['█','░','░','░','░']
      ],
      '8': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '9': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ]
    };
  }

  private generateCombinedPattern(digits: string): string {
    const patterns: { [key: string]: string[][] } = {
      '0': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '1': [
        ['░','░','█','░','░'],
        ['░','█','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['░','░','█','░','░'],
        ['█','█','█','█','█']
      ],
      '2': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█']
      ],
      '3': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '4': [
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█']
      ],
      '5': [
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '6': [
        ['█','█','█','█','█'],
        ['█','░','░','░','░'],
        ['█','░','░','░','░'],
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '7': [
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['░','░','░','█','░'],
        ['░','░','█','░','░'],
        ['░','█','░','░','░'],
        ['█','░','░','░','░']
      ],
      '8': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█']
      ],
      '9': [
        ['█','█','█','█','█'],
        ['█','░','░','░','█'],
        ['█','░','░','░','█'],
        ['█','█','█','█','█'],
        ['░','░','░','░','█'],
        ['░','░','░','░','█'],
        ['█','█','█','█','█']
      ]
    };

    // Combine patterns horizontally with 1 column spacing
    const digitPatterns = digits.split('').map(digit => patterns[digit] || patterns['0']);
    const height = 7;
    const digitWidth = 5;
    const spacing = 1;
    const totalWidth = digitPatterns.length * digitWidth + (digitPatterns.length - 1) * spacing;
    
    const combinedPattern: string[][] = [];
    
    for (let row = 0; row < height; row++) {
      const combinedRow: string[] = [];
      
      for (let digitIndex = 0; digitIndex < digitPatterns.length; digitIndex++) {
        const digitPattern = digitPatterns[digitIndex];
        
        // Add digit pattern
        for (let col = 0; col < digitWidth; col++) {
          combinedRow.push(digitPattern[row][col]);
        }
        
        // Add spacing between digits (except after last digit)
        if (digitIndex < digitPatterns.length - 1) {
          for (let s = 0; s < spacing; s++) {
            combinedRow.push('░');
          }
        }
      }
      
      combinedPattern.push(combinedRow);
    }

    // Generate SVG
    const cellSize = 20;
    const width = totalWidth * cellSize;
    const svgHeight = height * cellSize;

    let svg = `<svg width="${width}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    for (let row = 0; row < combinedPattern.length; row++) {
      for (let col = 0; col < combinedPattern[row].length; col++) {
        const x = col * cellSize;
        const y = row * cellSize;
        const fill = combinedPattern[row][col] === '█' ? '#000000' : '#ffffff';
        const stroke = '#cccccc';
        
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
      }
    }
    
    svg += '</svg>';
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

export const storage = new MemStorage();

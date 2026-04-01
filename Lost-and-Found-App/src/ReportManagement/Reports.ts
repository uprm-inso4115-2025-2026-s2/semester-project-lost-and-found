// to decide the status of the report
export type ReportStatus = 'ACTIVE' | 'RESOLVED' | 'CLAIMED';
export type Category = 'ELECTRONICS' | 'PERSONAL' | 'OFFICE SUPPLIES' | 'OTHER';
export type ReportType = 'LOST' | 'FOUND';

export interface CreateReportProps {
  title: string;
  description: string;
  dateFound: Date;
  location: string;
  category: Category;
  tags: string[];
  imageUrl?: string;
  createdBy: string;
  type: ReportType;
}

export class Report {
  private id: string;
  private title: string;
  private description: string;
  private dateFound: Date;
  private location: string;
  private category: Category;
  private tags: string[];
  private imageUrl?: string;
  private createdBy: string;
  private status: ReportStatus;
  private type: ReportType;

  private constructor(id: string, props: CreateReportProps, status: ReportStatus) {
    this.id = id;
    this.title = props.title.trim();
    this.description = props.description.trim();
    this.dateFound = props.dateFound;
    this.location = props.location.trim();
    this.category = props.category;
    this.tags = props.tags;
    this.imageUrl = props.imageUrl;
    this.createdBy = props.createdBy.trim();
    this.status = status;
    this.type = props.type;
  }

  public getID(): string { return this.id; }
  public getTitle(): string { return this.title; }
  public getDescription(): string { return this.description; }
  public getDateFound(): Date { return this.dateFound; }
  public getLocation(): string { return this.location; }
  
  public getRawCategory(): Category { return this.category; }

  public getCategory(): string { 
    switch (this.category) {
      case 'ELECTRONICS':
        return "Electronics";

      case "PERSONAL":
        return "Personal";

      case "OFFICE SUPPLIES":
        return "Office Supplies";

      case "OTHER":
        return "Other"
    }

    return "";
  }

  public getTags(): string[] { return this.tags; }
  public getImageURL(): string { return this.imageUrl ?? ""; }
  public getCreatedBy(): string { return this.createdBy; }

  public getStatus(): string { 
    switch(this.status) {
      case "ACTIVE":
        return "Active";

      case "RESOLVED":
        return "Resolved";

      case "CLAIMED":
        return "Claimed";
    }

    return ""; 
  }

  public getType(): string {
    switch(this.type) {
      case "LOST":
        return "Lost";

      case "FOUND":
        return "Found";
    }

    return "";
  }
  
  public setTitle(title: string): void { this.title = title; }
  public setDescription(description: string): void { this.description = description; }
  public setDateFound(dateFound: Date): void { this.dateFound = dateFound; }
  public setLocation(location: string): void { this.location = location; }
  public setCategory(category: Category): void { this.category = category; }
  public addTag(tag: string): void { this.tags.push(tag); } // Basic addition for now
  public removeTag(tag: string): void { 
    const index = this.tags.indexOf(tag);
    (index === -1) ? console.log("Tag not found") : this.tags.splice(index, 1);
  }
  public setImage(imageUrl: string): void { this.imageUrl = imageUrl; }
  public setStatus(status: ReportStatus): void { this.status = status; }

  // method to create a report
  static Create(props: CreateReportProps): Report {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `report_${Date.now()}`;
    return new Report(id, props, 'ACTIVE');
  }

  // create a default report for testing
  static CreateDefault(): Report {
    const report = Report.Create({
        title: '',
        description: '',
        dateFound: new Date(),
        location: '',
        category: 'OTHER',
        tags: ["None"],
        imageUrl: undefined,
        createdBy: '',
        type: "LOST"
      });

      return report;
  }

  public toSupabase() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dateFound: this.dateFound,
      location: this.location,
      category: this.getCategory(),
      tags: this.tags,
      imageURL: this.imageUrl,
      createdBy: this.createdBy,
      status: this.getStatus(),
      type: this.getType()
    };
  }

  static fromSupabase(id: string, prop: CreateReportProps, status: ReportStatus): Report {
      return new Report(id, prop, status);
  }
}

// dummy data to test each variable works correctly 
// const report = Report.Create({
//     title: 'I Phone 6 Million',
//     description: 'FUN EVENT',
//     dateFound: new Date('2026-02-26'),
//     location: 'Choliseo',
//     category: "ELECTRONICS",
//     tags: [],
//     imageUrl: undefined,
//     createdBy: 'Sasuke',
//   });

// console.log('ID:', report.getID());
// console.log('Title:', report.getTitle());
// console.log('Description:', report.getDescription());
// console.log('Date Found:', report.getDateFound());
// console.log('Location:', report.getLocation());
// console.log('Categories:', report.getCategory());
// console.log('Image URL:', report.getImageURL());
// console.log('Created By:', report.getCreatedBy());
// console.log('Status:', report.getStatus());
  
   

import { getDb } from "./db";
import { ObjectId } from "mongodb";

export interface Opportunity {
  _id?: ObjectId;
  name: string;
  ministry: string;
  category: string;
  description: string;
  benefit: string;
  benefitDetail: string;
  eligibility: string[];
  documents: string[];
  deadline: string;
  officialUrl: string;
  state?: string;
  educationLevel?: string;
  createdAt?: Date;
}

export async function getOpportunities(filter: any = {}): Promise<Opportunity[]> {
  try {
    const db = await getDb();
    const opportunities = db.collection<Opportunity>("opportunities");
    
    const query: any = {};
    if (filter.category) query.category = filter.category;
    if (filter.state) query.state = filter.state;
    if (filter.educationLevel) query.educationLevel = filter.educationLevel;
    
    const cursor = opportunities.find(query);
    if (filter.limit) cursor.limit(filter.limit);
    
    return await cursor.toArray();
  } catch (error) {
    console.error("Failed to get opportunities:", error);
    return [];
  }
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  try {
    const db = await getDb();
    const opportunities = db.collection<Opportunity>("opportunities");
    return await opportunities.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Failed to get opportunity by ID:", error);
    return null;
  }
}

export async function createOpportunity(data: Opportunity): Promise<{ insertedId: ObjectId }> {
  try {
    const db = await getDb();
    const opportunities = db.collection<Opportunity>("opportunities");
    const result = await opportunities.insertOne({
      ...data,
      createdAt: new Date(),
    });
    return { insertedId: result.insertedId };
  } catch (error) {
    console.error("Failed to create opportunity:", error);
    throw error;
  }
}

export async function bulkImportOpportunities(data: Opportunity[]): Promise<{ insertedCount: number }> {
  try {
    const db = await getDb();
    const opportunities = db.collection<Opportunity>("opportunities");
    const result = await opportunities.insertMany(
      data.map(item => ({ ...item, createdAt: new Date() }))
    );
    return { insertedCount: result.insertedCount };
  } catch (error) {
    console.error("Failed to bulk import opportunities:", error);
    throw error;
  }
}

export async function updateOpportunity(id: string, data: Partial<Opportunity>): Promise<{ modifiedCount: number }> {
  try {
    const db = await getDb();
    const opportunities = db.collection<Opportunity>("opportunities");
    const result = await opportunities.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    return { modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error("Failed to update opportunity:", error);
    throw error;
  }
}

export async function deleteOpportunity(id: string): Promise<{ deletedCount: number }> {
  try {
    const db = await getDb();
    const opportunities = db.collection<Opportunity>("opportunities");
    const result = await opportunities.deleteOne({ _id: new ObjectId(id) });
    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Failed to delete opportunity:", error);
    throw error;
  }
}

export async function getOpportunityStats(): Promise<{ total: number; byCategory: Record<string, number> }> {
  try {
    const db = await getDb();
    const opportunities = db.collection<Opportunity>("opportunities");
    const total = await opportunities.countDocuments();
    const pipeline = [
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ];
    const categoryResults = await opportunities.aggregate(pipeline).toArray();
    const byCategory: Record<string, number> = {};
    categoryResults.forEach((item: any) => {
      byCategory[item._id] = item.count;
    });
    return { total, byCategory };
  } catch (error) {
    console.error("Failed to get opportunity stats:", error);
    return { total: 0, byCategory: {} };
  }
}

export async function verifyOpportunityUrl(id: string): Promise<{ valid: boolean; statusCode?: number }> {
  try {
    const opportunity = await getOpportunityById(id);
    if (!opportunity) {
      return { valid: false };
    }
    // Note: URL verification would require making HTTP requests
    // This is a placeholder implementation
    return { valid: true };
  } catch (error) {
    console.error("Failed to verify opportunity URL:", error);
    return { valid: false };
  }
}

import pincodeStops from "@/../data/pincodeStops.json";
import type { NextApiRequest, NextApiResponse } from "next";

// Type definition for the pincode data structure
type PincodeData = {
  busStops: string[];
  twitterQueries: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pincode } = req.query;
  const pincodeData = (pincodeStops as Record<string, PincodeData>)[pincode as string];

  if (!pincodeData) {
    return res.status(404).json({ error: "No bus info for this pincode" });
  }

  // Return both bus stops and Twitter queries for enhanced functionality
  res.status(200).json({ 
    pincode, 
    stops: pincodeData.busStops,
    twitterQueries: pincodeData.twitterQueries
  });
}

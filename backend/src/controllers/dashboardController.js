import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import Activity from "../models/Activity.js";


export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const leadAnalytics = await Lead.aggregate([
      {
        $match: { assignedTo: userId }
      },
      {
        $facet: {
          funnel: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          topSources: [
            { $group: { _id: "$source", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          stats: [
            {
              $group: {
                _id: null,
                totalLeads: { $sum: 1 },
                newLeads: { $sum: { $cond: [{ $eq: ["$status", "NEW"] }, 1, 0] } },
                contactedLeads: { $sum: { $cond: [{ $eq: ["$status", "CONTACTED"] }, 1, 0] } },
                interestedLeads: { $sum: { $cond: [{ $eq: ["$status", "INTERESTED"] }, 1, 0] } },
                convertedLeads: { $sum: { $cond: [{ $eq: ["$status", "CONVERTED"] }, 1, 0] } },
                lostLeads: { $sum: { $cond: [{ $eq: ["$status", "LOST"] }, 1, 0] } },
                overdueFollowUps: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $lt: ["$nextFollowUpAt", new Date()] },
                          { $ne: ["$nextFollowUpAt", null] },
                          { $nin: ["$status", ["LOST", "CONVERTED"]] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            },
            {
              $project: {
                _id: 0,
                totalLeads: 1,
                newLeads: 1,
                contactedLeads: 1,
                interestedLeads: 1,
                convertedLeads: 1,
                lostLeads: 1,
                overdueFollowUps: 1,
                conversionRate: {
                  $cond: [
                    { $gt: ["$totalLeads", 0] },
                    { $multiply: [{ $divide: ["$convertedLeads", "$totalLeads"] }, 100] },
                    0
                  ]
                }
              }
            }
          ]
        }
      }
    ]);

    const result = leadAnalytics[0];
    const funnel = {};
    result.funnel.forEach((stat) => {
      funnel[stat._id] = stat.count;
    });

    const stats = result.stats[0] || {
      totalLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      interestedLeads: 0,
      convertedLeads: 0,
      lostLeads: 0,
      overdueFollowUps: 0,
      conversionRate: 0
    };
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); 

    const activityResults = await Activity.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = activityResults.find(item => item._id === dateStr);
      last7Days.push({
        date: dateStr,
        count: dayData ? dayData.count : 0,
      });
    }
    const recentActivities = await Activity.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("lead", "name phone status")
      .populate("createdBy", "name");

    res.status(200).json({
      success: true,
      data: {
        funnel,
        conversionRate: Math.round(stats.conversionRate * 100) / 100,
        overdueFollowUps: stats.overdueFollowUps,
        topSources: result.topSources,
        activityGraph: last7Days,
        recentActivities,
        stats,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ success: false,message: "Internal server error",});
  }
};

package com.example.trainy.model;

public class DelayStats {

    private long totalCount;
    private long canceledCount;
    private long delayedCount;
    private long onTimeCount;
    private double averageDelayMinutes;
    private long maxDelayMinutes;

    public DelayStats(long totalCount, long canceledCount, long delayedCount, long onTimeCount, double averageDelayMinutes, long maxDelayMinutes) {
        this.totalCount = totalCount;
        this.canceledCount = canceledCount;
        this.delayedCount = delayedCount;
        this.onTimeCount = onTimeCount;
        this.averageDelayMinutes = averageDelayMinutes;
        this.maxDelayMinutes = maxDelayMinutes;
    }

    public long getTotalCount() { return totalCount; }
    public long getCanceledCount() { return canceledCount; }
    public long getDelayedCount() { return delayedCount; }
    public long getOnTimeCount() { return onTimeCount; }
    public double getAverageDelayMinutes() { return averageDelayMinutes; }
    public long getMaxDelayMinutes() { return maxDelayMinutes; }
}

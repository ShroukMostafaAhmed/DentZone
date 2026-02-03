'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function Settings() {
    return (
        <div className="h-[calc(100vh-75px)]">
            <Card>
                <CardHeader className="border-b border-solid border-default-200 mb-6">
                    <CardTitle>Notification Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Email Notifications</Label>
                            <Label>Receive emails for important updates</Label>
                        </div>
                        <div>
                            <Switch color="info" size={"lg"} />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Order Notifications</Label>
                            <Label>Receive notifications when new orders are placed</Label>
                        </div>
                        <div>
                            <Switch color="info" size={"lg"} />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Inventory Alerts</Label>
                            <Label>Get notified when products are low in stock</Label>
                        </div>
                        <div>
                            <Switch color="info" size={"lg"} />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Promotional Emails</Label>
                            <Label>Receive marketing and promotional emails</Label>
                        </div>
                        <div>
                            <Switch color="info" size={"lg"} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Settings;
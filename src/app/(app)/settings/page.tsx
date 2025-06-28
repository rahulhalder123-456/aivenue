import { SettingsForm } from "./_components/settings-form";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
      </div>
      <p className="text-muted-foreground max-w-2xl">
        Manage your account settings and preferences.
      </p>
      
      <div className="mt-8">
        <SettingsForm />
      </div>
    </div>
  );
}

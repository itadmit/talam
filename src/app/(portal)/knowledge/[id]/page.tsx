import { getKnowledgeItem } from "@/actions/knowledge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Download,
  FileText,
  Building2,
  Tag,
  Clock,
  User,
  BookOpen,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  green: {
    label: "מעודכן",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  yellow: {
    label: "עדכון נדרש",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    dotColor: "bg-yellow-500",
  },
  red: {
    label: "חסר מידע",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

export default async function KnowledgeItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getKnowledgeItem(id);
  if (!item) notFound();

  const sc = statusConfig[item.status] || statusConfig.green;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/knowledge">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          חזרה למרכז מידע
        </Button>
      </Link>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">{item.title}</h1>
              {item.summary && (
                <p className="text-muted-foreground mt-2">{item.summary}</p>
              )}
            </div>
            <Badge className={`shrink-0 ${sc.color}`}>{sc.label}</Badge>
          </div>

          {item.statusNote && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
              {item.statusNote}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 flex-wrap mt-4 text-sm text-muted-foreground">
            {item.category && (
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                {item.category.name}
              </span>
            )}
            {item.ownerDepartment && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {item.ownerDepartment.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(item.updatedAt).toLocaleDateString("he-IL")}
            </span>
            {item.updatedBy && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {item.updatedBy.name || item.updatedBy.email}
              </span>
            )}
          </div>

          {/* Source Note */}
          {item.sourceNote && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-medium">מקור מידע:</span> {item.sourceNote}
            </div>
          )}

          {/* Tags */}
          {item.itemTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {item.itemTags.map(({ tag }: { tag: { id: string; name: string } }) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {item.content && (
        <Card>
          <CardContent className="p-6">
            <div
              className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {item.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              קבצים מצורפים ({item.attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {item.attachments.map((file: { id: string; fileName: string; size?: number | null; storageUrl?: string | null }) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.size ? `${(file.size / 1024).toFixed(0)} KB` : ""}
                    </p>
                  </div>
                </div>
                {file.storageUrl && (
                  <a
                    href={file.storageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-3.5 w-3.5" />
                      הורד
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

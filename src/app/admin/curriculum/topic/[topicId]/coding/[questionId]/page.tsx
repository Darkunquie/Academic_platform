import { notFound } from "next/navigation";
import { getTopicChain } from "@/modules/curriculum/admin";
import { getCodingQuestion, listTestCases } from "@/modules/coding/service";
import {
  addTestCaseAction,
  deleteTestCaseAction,
  updateCodingLanguagesAction,
  updateCodingConstraintsAction,
} from "@/modules/coding/actions";
import { LANG_KEYS, LANGUAGES } from "@/modules/coding/languages";
import { Breadcrumb } from "@/components/curriculum/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LangCheckboxes } from "@/components/coding/lang-checkboxes";

export const dynamic = "force-dynamic";

export default async function CodingQuestionAdminPage({
  params,
}: {
  params: Promise<{ topicId: string; questionId: string }>;
}) {
  const { topicId, questionId } = await params;
  const topic = await getTopicChain(topicId);
  const question = await getCodingQuestion(questionId);
  if (!topic || !question) notFound();

  const cases = await listTestCases(questionId);
  const path = `/admin/curriculum/topic/${topicId}/coding/${questionId}`;

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Curriculum", href: "/admin/curriculum" },
          { label: topic.name, href: `/admin/curriculum/topic/${topicId}` },
          { label: "Coding", href: `/admin/curriculum/topic/${topicId}/coding` },
          { label: question.title },
        ]}
      />
      <h1 className="text-2xl font-bold">{question.title}</h1>
      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
        {question.prompt}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Constraints & limits</h2>
        <form action={updateCodingConstraintsAction} className="mt-3 space-y-3">
          <input type="hidden" name="id" value={questionId} />
          <input type="hidden" name="revalidate" value={path} />
          <div>
            <Label>Constraints (one per line)</Label>
            <textarea
              name="constraints"
              rows={4}
              defaultValue={question.constraints ?? ""}
              placeholder={"1 ≤ N ≤ 10^5\n-10^9 ≤ a[i] ≤ 10^9"}
              className="w-full rounded-md border border-gray-300 p-3 font-mono text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Time limit (ms)</Label>
              <Input
                name="timeLimitMs"
                type="number"
                min={100}
                step={100}
                defaultValue={question.timeLimitMs ?? 2000}
              />
            </div>
            <div>
              <Label>Memory limit (KB)</Label>
              <Input
                name="memLimitKb"
                type="number"
                min={16000}
                step={1000}
                defaultValue={question.memLimitKb ?? 128000}
              />
            </div>
          </div>
          <Button type="submit">Save constraints</Button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Allowed languages</h2>
        <form
          action={updateCodingLanguagesAction}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="id" value={questionId} />
          <input type="hidden" name="revalidate" value={path} />
          <LangCheckboxes
            options={LANG_KEYS.map((k) => ({ key: k, label: LANGUAGES[k].label }))}
            defaultSelected={question.languages as string[]}
          />
          <Button type="submit">Save languages</Button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Add test case</h2>
        <form action={addTestCaseAction} className="mt-3 space-y-3">
          <input type="hidden" name="questionId" value={questionId} />
          <input type="hidden" name="revalidate" value={path} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Input (stdin)</Label>
              <textarea
                name="stdin"
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2 font-mono text-sm"
                placeholder="2 3"
              />
            </div>
            <div>
              <Label>Expected output</Label>
              <textarea
                name="expected"
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2 font-mono text-sm"
                placeholder="5"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isSample" /> Sample (visible to
              student)
            </label>
            <div className="flex items-center gap-2">
              <Label className="mb-0">Weight</Label>
              <Input
                name="weight"
                type="number"
                defaultValue={1}
                className="w-20"
              />
            </div>
            <Button type="submit">Add test case</Button>
          </div>
        </form>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold">Test cases ({cases.length})</h2>
        {cases.map((tc) => (
          <div
            key={tc.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-3 text-sm"
          >
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 font-mono text-xs">
                in: {tc.stdin || "(none)"}
              </pre>
              <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 font-mono text-xs">
                out: {tc.expectedOutput}
              </pre>
            </div>
            <div className="flex items-center gap-2">
              {tc.isSample && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  sample
                </span>
              )}
              <form action={deleteTestCaseAction}>
                <input type="hidden" name="id" value={tc.id} />
                <input type="hidden" name="revalidate" value={path} />
                <Button type="submit" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

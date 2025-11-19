<template>
  <div class="max-w-[1200px] mx-auto p-4 space-y-4">
    <div class="card p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ t('editor.title') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label class="text-xs text-gray-600">{{ t('common.date') }}</label>
          <DatePicker v-model="date" />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs text-gray-600">{{ t('common.group') }} ({{ t('editor.optional') }})</label>
          <input v-model="groupName" class="input" :placeholder="t('editor.groupPlaceholder')" />
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-primary" :disabled="!date || loading" @click="buildPlan">{{ t('editor.build') }}</button>
          <button class="btn-secondary" :disabled="!date || loading" @click="refresh">{{ t('editor.refresh') }}</button>
        </div>
        <div class="md:col-span-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.from_plan" /> <span class="text-sm">{{ t('editor.fromPlan') }}</span></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.enforce_no_gaps" /> <span class="text-sm">{{ t('editor.noGaps') }}</span></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.allow_repeated_subjects" /> <span class="text-sm">{{ t('editor.allowRepeats') }}</span></div>
          <div class="flex items-center gap-2"><label class="text-xs text-gray-600">{{ t('editor.maxRepeats') }}</label><input v-model.number="opts.max_repeats_per_subject" class="input w-24" type="number" min="1" /></div>
          <div class="flex items-center gap-2"><label class="text-xs text-gray-600">{{ t('editor.pairsPerDay') }}</label><input v-model.number="opts.max_pairs_per_day" class="input w-24" type="number" min="1" /></div>
          <div class="flex items-center gap-2"><input type="checkbox" v-model="opts.use_both_shifts" /> <span class="text-sm">{{ t('editor.bothShifts') }}</span></div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <button class="btn-success" :disabled="!day?.id || loading" @click="approve">{{ t('editor.approve') }}</button>
        <button class="btn-secondary" :disabled="!day?.id || loading" @click="downloadExcel">{{ t('editor.export') }}</button>
        <button class="btn-secondary" :disabled="!day?.id || loading" @click="replaceVacant">{{ t('editor.autoVacant') }}</button>
        <button class="btn-primary" :disabled="loading" @click="openAddModal">{{ t('editor.addEntry') }}</button>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-xs text-gray-600">{{ t('editor.view') }}</span>
          <div class="inline-flex rounded-md overflow-hidden border">
            <button :class="['px-3 py-1 text-sm', viewMode==='table' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100']" @click="viewMode='table'">{{ t('editor.viewTable') }}</button>
            <button :class="['px-3 py-1 text-sm', viewMode==='cards' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100']" @click="viewMode='cards'">{{ t('editor.viewCards') }}</button>
          </div>
        </div>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="onlyDiffs" /> {{ t('editor.showOnlyDiffs') }}
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="onlyApproved" /> {{ t('analytics.onlyApproved') }}
        </label>
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="onlyEmptyRooms" /> {{ t('editor.onlyEmptyRooms') }}
        </label>
      </div>
    </div>


    <!-- Autofill controls -->
    <div class="card p-4 space-y-3">
      <h3 class="text-sm font-semibold">{{ t('editor.autofillTitle') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div class="flex items-center gap-2 md:col-span-2">
          <label class="text-xs text-gray-600">{{ t('editor.ensurePairsPerDay') }}</label>
          <input v-model.number="autofill.ensure_pairs_per_day" class="input w-24" type="number" min="1" />
        </div>
        <div class="flex items-center gap-2"><input type="checkbox" v-model="autofill.allow_repeated_subjects" /> <span class="text-sm">{{ t('editor.allowRepeats') }}</span></div>
        <div class="flex items-center gap-2"><label class="text-xs text-gray-600">{{ t('editor.maxRepeats') }}</label><input v-model.number="autofill.max_repeats_per_subject" class="input w-24" type="number" min="1" /></div>
        <div class="flex items-center gap-2"><input type="checkbox" v-model="autofill.use_both_shifts" /> <span class="text-sm">{{ t('editor.bothShifts') }}</span></div>
        <div class="flex items-center gap-2">
          <button class="btn-primary" :disabled="!date || loading" @click="runAutofill">{{ t('editor.autofillRun') }}</button>
        </div>
      </div>
    </div>

    <div v-if="!day && noDay" class="card p-4 text-sm text-gray-600">
      <span v-if="isToday">{{ t('editor.noDayToday') }}</span>
      <span v-else>{{ t('editor.noDayOnDate') }}</span>
    </div>

    <div v-if="day" class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div v-if="viewMode==='table'" class="xl:col-span-3">
        <div class="card p-4 overflow-auto">
          <div class="flex items-center mb-2">
            <h3 class="text-sm font-semibold">{{ t('editor.tableByGroup') }}</h3>
          </div>
          <table class="min-w-full text-sm align-top">
            <thead>
              <tr class="text-left text-gray-600">
                <th class="py-2 pr-4 sticky top-0 bg-white/90 backdrop-blur z-10 border-b">{{ t('common.group') }}</th>
                <th class="py-2 pr-4 sticky top-0 bg-white/90 backdrop-blur z-10 border-b">{{ t('dayPlan.time') }}</th>
                <th class="py-2 pr-4 sticky top-0 bg-white/90 backdrop-blur z-10 border-b">{{ t('editor.plan') }}</th>
                <th class="py-2 pr-4 sticky top-0 bg-white/90 backdrop-blur z-10 border-b">{{ t('editor.actual') }}</th>
                <th class="py-2 pr-4 sticky top-0 bg-white/90 backdrop-blur z-10 border-b">{{ t('editor.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r,i) in alignedRows" :key="r.group_name + '-' + r.start_time + '-' + i" class="border-t odd:bg-gray-50 hover:bg-blue-50/40 transition-colors">
                <td class="py-1 pr-4 whitespace-nowrap">{{ r.group_name }}</td>
                <td class="py-1 pr-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span>{{ r.start_time }}</span>
                    <template v-if="dayReportData">
                      <span v-if="rowReport(r).b" class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700">{{ rowReport(r).b }}</span>
                      <span v-if="rowReport(r).w" class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-yellow-100 text-yellow-700">{{ rowReport(r).w }}</span>
                    </template>
                  </div>
                </td>
                <td class="py-1 pr-4">
                  <div v-if="r.plan" class="space-y-1">
                    <div class="font-medium">{{ r.plan.subject_name }}</div>
                    <div class="text-xs text-gray-600">{{ r.plan.teacher_name }} • {{ r.plan.room_name }}</div>
                    <div class="flex flex-wrap gap-1">
                      <span v-for="(chip, idx) in chips(r.plan, 'plan')" :key="idx" class="px-1.5 py-0.5 rounded text-[11px] font-medium" :class="chip.class">{{ chip.label }}</span>
                      <span class="px-1.5 py-0.5 rounded text-[11px] font-medium" :class="statusBadgeClass(r.plan.approval_status || (r.plan as any).status)">{{ statusLabel(r.plan.approval_status || (r.plan as any).status) }}</span>
                    </div>
                  </div>
                  <div v-else>—</div>
                </td>
                <td class="py-1 pr-4">
                  <div v-if="r.actual" class="space-y-1">
                    <div class="font-medium">{{ r.actual.subject_name }}</div>
                    <div class="text-xs text-gray-600">{{ r.actual.teacher_name }} • {{ r.actual.room_name }}</div>
                    <div class="flex flex-wrap gap-1">
                      <span v-for="(chip, idx) in chips(r.actual, 'actual')" :key="idx" class="px-1.5 py-0.5 rounded text-[11px] font-medium" :class="chip.class">{{ chip.label }}</span>
                      <span class="px-1.5 py-0.5 rounded text-[11px] font-medium" :class="statusBadgeClass(r.actual.approval_status || (r.actual as any).status)">{{ statusLabel(r.actual.approval_status || (r.actual as any).status) }}</span>
                    </div>
                  </div>
                  <div v-else>—</div>
                </td>
                <td class="py-1 pr-4">
                  <div class="flex flex-wrap gap-2">
                    <template v-if="r.actual">
                      <button class="btn-xs btn-secondary" @click="openEdit(r.actual)" :disabled="!entryId(r.actual)" :title="!entryId(r.actual) ? (t('editor.actionRequiresDay') as string) : ''">✏️ {{ t('editor.edit') }}</button>
                      <button class="btn-xs btn-secondary text-red-700" @click="deleteEntry(r.actual)" :disabled="!entryId(r.actual)" :title="!entryId(r.actual) ? (t('editor.actionRequiresDay') as string) : ''">🗑️ {{ t('editor.delete') }}</button>
                      <button class="btn-xs btn-secondary" @click="openReplace(r.actual)" :disabled="!entryId(r.actual)" :title="!entryId(r.actual) ? (t('editor.actionRequiresDay') as string) : ''">{{ t('editor.replace') }}</button>
                    </template>
                    <button v-else class="btn-xs btn-primary" @click="addFromRow(r)">＋ {{ t('editor.addEntry') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="xl:col-span-3">
        <div class="card p-3 flex flex-wrap gap-2 items-center">
          <span class="badge bg-green-100 text-green-700">{{ t('editor.added') }}: {{ day.diff_counters?.added ?? 0 }}</span>
          <span class="badge bg-red-100 text-red-700">{{ t('editor.removed') }}: {{ day.diff_counters?.removed ?? 0 }}</span>
          <span class="badge bg-yellow-100 text-yellow-700">{{ t('editor.changed') }}: {{ day.diff_counters?.changed ?? 0 }}</span>
          <span class="badge bg-gray-100 text-gray-700">{{ t('editor.same') }}: {{ day.diff_counters?.same ?? 0 }}</span>
          <span class="ml-auto text-sm text-gray-600">
            {{ t('editor.pairs') }}: {{ day.planned_pairs }} / {{ day.approved_pairs }} • AH: {{ day.planned_hours }} / {{ day.approved_hours }}
          </span>
        </div>
      </div>
      <!-- Operation report / analysis -->
      <div v-if="(lastOpReport && (lastOpReport.blockers?.length || lastOpReport.warnings?.length)) || dayReportData" class="xl:col-span-3">
        <div class="card p-4">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-sm font-semibold">{{ t('report.title') }}</h3>
          </div>
          <div v-if="lastOpReport && (lastOpReport.blockers?.length || lastOpReport.warnings?.length)" class="mb-3">
            <div class="text-xs text-gray-600 mb-1">{{ t('editor.lastOperation') || 'Последняя операция' }}</div>
            <div>
              <div class="text-sm font-medium text-red-700" v-if="lastOpReport.blockers?.length">{{ t('report.blockers') }} ({{ lastOpReport.blockers.length }}):</div>
              <ul v-if="lastOpReport.blockers?.length" class="list-disc list-inside text-sm text-red-700">
                <li v-for="(b,i) in lastOpReport.blockers" :key="'b'+i">{{ b }}</li>
              </ul>
              <div class="text-sm font-medium text-yellow-700 mt-2" v-if="lastOpReport.warnings?.length">{{ t('report.warnings') }} ({{ lastOpReport.warnings.length }}):</div>
              <ul v-if="lastOpReport.warnings?.length" class="list-disc list-inside text-sm text-yellow-700">
                <li v-for="(w,i) in lastOpReport.warnings" :key="'w'+i">{{ w }}</li>
              </ul>
            </div>
          </div>
          <div v-if="dayReportData">
            <div class="text-xs text-gray-600 mb-1">{{ t('editor.currentDay') || 'Текущий день' }}</div>
            <div>
              <div class="text-sm font-medium text-red-700" v-if="dayReportData.blockers?.length">{{ t('report.blockers') }} ({{ dayReportData.blockers.length }}):</div>
              <ul v-if="dayReportData.blockers?.length" class="list-disc list-inside text-sm text-red-700">
                <li v-for="(b,i) in dayReportData.blockers" :key="'db'+i">{{ b }}</li>
              </ul>
              <div class="text-sm font-medium text-yellow-700 mt-2" v-if="dayReportData.warnings?.length">{{ t('report.warnings') }} ({{ dayReportData.warnings.length }}):</div>
              <ul v-if="dayReportData.warnings?.length" class="list-disc list-inside text-sm text-yellow-700">
                <li v-for="(w,i) in dayReportData.warnings" :key="'dw'+i">{{ w }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- Detailed analysis table -->
      <div v-if="analysisRows.length" class="xl:col-span-3">
        <div class="card p-4 overflow-auto">
          <h3 class="text-sm font-semibold mb-2">{{ t('editor.analysisTable') }}</h3>
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-600">
                <th class="py-1 pr-4">{{ t('editor.severity') }}</th>
                <th class="py-1 pr-4">{{ t('common.group') }}</th>
                <th class="py-1 pr-4">{{ t('dayPlan.time') }}</th>
                <th class="py-1 pr-4">{{ t('report.title') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r,i) in analysisRows" :key="i" class="border-t">
                <td class="py-1 pr-4">
                  <span :class="['px-2 py-0.5 rounded text-xs font-medium', r.severity==='blocker' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700']">{{ r.severity==='blocker' ? t('report.blockers') : t('report.warnings') }}</span>
                </td>
                <td class="py-1 pr-4">{{ r.group_name || '—' }}</td>
                <td class="py-1 pr-4">{{ r.start_time || '—' }}</td>
                <td class="py-1 pr-4">{{ r.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="viewMode==='cards'" class="xl:col-span-3 space-y-3">
        <div class="card p-4">
          <div class="grid grid-cols-1 gap-3">
            <div v-for="(g,gi) in groupedRows" :key="g.group_name + '-' + gi" class="rounded-md border bg-white/60">
              <button class="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-t-md" @click="toggleGroup(g.group_name)">
                <div class="font-medium">{{ g.group_name }}</div>
                <div class="text-xs text-gray-500">{{ isOpen(g.group_name) ? '▲' : '▼' }}</div>
              </button>
              <div v-show="isOpen(g.group_name)" class="p-2 space-y-2 border-t">
                <div v-if="groupReport(dayReportData, g.group_name).blockers.length || groupReport(dayReportData, g.group_name).warnings.length" class="rounded bg-yellow-50 p-2 text-xs">
                  <div v-if="groupReport(dayReportData, g.group_name).blockers.length" class="text-red-700 font-medium">{{ t('report.blockers') }}:</div>
                  <ul v-if="groupReport(dayReportData, g.group_name).blockers.length" class="list-disc list-inside text-red-700">
                    <li v-for="(b,i) in groupReport(dayReportData, g.group_name).blockers" :key="'gb'+i">{{ b }}</li>
                  </ul>
                  <div v-if="groupReport(dayReportData, g.group_name).warnings.length" class="text-yellow-700 font-medium mt-1">{{ t('report.warnings') }}:</div>
                  <ul v-if="groupReport(dayReportData, g.group_name).warnings.length" class="list-disc list-inside text-yellow-700">
                    <li v-for="(w,i) in groupReport(dayReportData, g.group_name).warnings" :key="'gw'+i">{{ w }}</li>
                  </ul>
                </div>
                <div v-for="(r,i) in g.rows" :key="r.group_name + '-' + r.start_time + '-' + i" class="rounded-md p-2 border">
                  <div class="text-xs text-gray-500 mb-2">
                    {{ r.start_time }}
                    <span v-if="slotOccupancyLabel(r.start_time)" class="ml-2 text-[11px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">{{ slotOccupancyLabel(r.start_time) }}</span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- Plan card -->
                    <div class="border rounded-md p-3 bg-gray-50" :class="r.plan ? entryBoxClass(r.plan, 'plan') : 'border-dashed'">
                      <div v-if="r.plan" class="space-y-1">
                        <div class="text-sm text-gray-600 flex items-center gap-2">
                          <span>{{ r.plan.start_time }}–{{ r.plan.end_time }}</span>
                          <span class="px-2 py-0.5 rounded text-xs font-medium" :class="statusBadgeClass(r.plan.approval_status || (r.plan as any).status)">{{ statusLabel(r.plan.approval_status || (r.plan as any).status) }}</span>
                        </div>
                        <div class="text-base font-semibold">{{ r.plan.subject_name }}</div>
                        <div class="text-sm text-gray-700 flex items-center gap-2">
                          <span>{{ r.plan.teacher_name }} • {{ r.plan.room_name }}</span>
                          <span v-for="(chip, idx) in chips(r.plan, 'plan')" :key="idx" class="px-2 py-0.5 rounded text-xs font-medium" :class="chip.class">{{ chip.label }}</span>
                        </div>
                      </div>
                      <div v-else class="text-sm text-gray-500">{{ t('editor.noPlan') }}</div>
                    </div>
                    <!-- Actual card -->
                    <div class="border rounded-md p-3" :class="r.actual ? [entryBoxClass(r.actual, 'actual'), entryIssueClass(r.actual)] : 'bg-gray-50 border-dashed'">
                      <div class="flex items-center justify-between">
                        <div class="text-sm text-gray-600 flex items-center gap-2">
                          <span>{{ r.start_time }}</span>
                          <span v-if="r.actual" class="px-2 py-0.5 rounded text-xs font-medium" :class="statusBadgeClass(r.actual.approval_status || (r.actual as any).status)">{{ statusLabel(r.actual.approval_status || (r.actual as any).status) }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <template v-if="r.actual">
                            <button class="btn-xs btn-secondary" @click="openEdit(r.actual)" :disabled="!entryId(r.actual)" :title="!entryId(r.actual) ? (t('editor.actionRequiresDay') as string) : ''">✏️ {{ t('editor.edit') }}</button>
                            <button class="btn-xs btn-secondary text-red-700" @click="deleteEntry(r.actual)" :disabled="!entryId(r.actual)" :title="!entryId(r.actual) ? (t('editor.actionRequiresDay') as string) : ''">🗑️ {{ t('editor.delete') }}</button>
                            <button class="btn-xs btn-secondary" @click="openReplace(r.actual)" :disabled="!entryId(r.actual)" :title="!entryId(r.actual) ? (t('editor.actionRequiresDay') as string) : ''">{{ t('editor.replace') }}</button>
                          </template>
                          <button v-else class="btn-xs btn-primary" @click="addFromRow(r)">＋ {{ t('editor.addEntry') }}</button>
                        </div>
                      </div>
                      <div v-if="r.actual" class="mt-1">
                        <div class="text-base font-semibold">{{ r.actual.subject_name }}</div>
                        <div class="text-sm text-gray-700 flex items-center gap-2 flex-wrap">
                          <span :class="!r.actual.teacher_name ? 'italic text-gray-500' : ''" :title="!r.actual.teacher_name ? 'Нет преподавателя' : ''">
                            {{ r.actual.teacher_name || '—' }}
                          </span>
                          <span>•</span>
                          <span :class="!r.actual.room_name ? 'italic text-red-600' : ''" :title="!r.actual.room_name ? (t('editor.needRoom') as string) : ''">
                            {{ r.actual.room_name || t('editor.noRoom') }}
                          </span>
                          <span v-if="!r.actual.room_name" class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700">{{ t('editor.needRoom') }}</span>
                        </div>
                        <div class="mt-1 flex flex-wrap gap-1">
                          <span v-for="(chip, idx) in chips(r.actual, 'actual')" :key="idx" class="px-2 py-0.5 rounded text-xs font-medium" :class="chip.class">{{ chip.label }}</span>
                        </div>
                      </div>
                      <div v-else class="text-sm text-gray-500">{{ t('common.noData') }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-3 space-y-4">
        <div class="card p-4 space-y-2">
          <h3 class="text-sm font-semibold">{{ t('editor.totals') }}</h3>
          <div class="text-sm text-gray-700">{{ t('editor.pairs') }}: {{ day.planned_pairs }} / {{ day.approved_pairs }}</div>
          <div class="text-sm text-gray-700">AH: {{ day.planned_hours }} / {{ day.approved_hours }}</div>
          <div v-if="day.reasons?.length" class="pt-2">
            <div class="text-xs font-semibold text-gray-600">{{ t('editor.reasons') }}</div>
            <ul class="list-disc list-inside text-xs text-gray-700">
              <li v-for="(r,i) in day.reasons" :key="i">{{ r }}</li>
            </ul>
          </div>
        </div>

        <div class="card p-4 overflow-auto">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-semibold">{{ t('editor.groupsSummary') }}</h3>
            <label class="text-xs text-gray-600 inline-flex items-center gap-2"><input type="checkbox" v-model="showBars" /> {{ t('editor.showBars') }}</label>
          </div>
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-600"><th class="py-1 pr-4">Группа</th><th class="py-1 pr-4">Пары (act/plan/Δ)</th><th class="py-1 pr-4">Часы AH (act/plan/Δ)</th></tr>
            </thead>
            <tbody>
              <tr v-for="(g,i) in day.group_hours_summary" :key="i" class="border-t">
                <td class="py-1 pr-4">{{ g.group_name }}</td>
                <td class="py-1 pr-4">
                  <div class="flex items-center gap-2">
                    <span>{{ g.actual_pairs }} / {{ g.plan_pairs }} / {{ g.delta_pairs }}</span>
                    <div v-if="showBars" class="w-28 bg-gray-100 rounded h-2 overflow-hidden"><div class="h-2 bg-blue-500" :style="{ width: pctWidth(g.actual_pairs, g.plan_pairs) }"></div></div>
                  </div>
                </td>
                <td class="py-1 pr-4">
                  <div class="flex items-center gap-2">
                    <span>{{ g.actual_hours_AH }} / {{ g.plan_hours_AH }} / {{ g.delta_hours_AH }}</span>
                    <div v-if="showBars" class="w-28 bg-gray-100 rounded h-2 overflow-hidden"><div class="h-2 bg-emerald-500" :style="{ width: pctWidth(g.actual_hours_AH, g.plan_hours_AH) }"></div></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card p-4 overflow-auto">
          <h3 class="text-sm font-semibold mb-2">{{ t('editor.subjectsSummary') }}</h3>
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-600"><th class="py-1 pr-4">Группа</th><th class="py-1 pr-4">Предмет</th><th class="py-1 pr-4">Пары (act/plan/Δ)</th><th class="py-1 pr-4">Часы AH (act/plan/Δ)</th></tr>
            </thead>
            <tbody>
              <tr v-for="(s,i) in day.subject_hours_summary" :key="i" class="border-t">
                <td class="py-1 pr-4">{{ s.group_name }}</td>
                <td class="py-1 pr-4">{{ s.subject_name }}</td>
                <td class="py-1 pr-4">
                  <div class="flex items-center gap-2">
                    <span>{{ s.actual_pairs }} / {{ s.plan_pairs }} / {{ s.delta_pairs }}</span>
                    <div v-if="showBars" class="w-28 bg-gray-100 rounded h-2 overflow-hidden"><div class="h-2 bg-blue-500" :style="{ width: pctWidth(s.actual_pairs, s.plan_pairs) }"></div></div>
                  </div>
                </td>
                <td class="py-1 pr-4">
                  <div class="flex items-center gap-2">
                    <span>{{ s.actual_hours_AH }} / {{ s.plan_hours_AH }} / {{ s.delta_hours_AH }}</span>
                    <div v-if="showBars" class="w-28 bg-gray-100 rounded h-2 overflow-hidden"><div class="h-2 bg-emerald-500" :style="{ width: pctWidth(s.actual_hours_AH, s.plan_hours_AH) }"></div></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Side panel: replacement options -->
    <Modal :open="showOptions" :title="`${t('editor.replaceTitle')}: ${entryForOptions?.subject_name || ''} (${entryForOptions?.start_time || ''}–${entryForOptions?.end_time || ''})`" @close="closeOptions">
      <div>
        <div class="flex items-center gap-2 border-b mb-3">
          <button :class="tabClass('teachers')" @click="tab='teachers'">{{ t('editor.teachersTab') }}</button>
          <button :class="tabClass('rooms')" @click="tab='rooms'">{{ t('editor.roomsTab') }}</button>
          <button v-if="tab==='rooms'" class="btn-secondary text-red-700 ml-auto" @click="clearCurrentEntryRoom">{{ t('editor.clearRoom') }}</button>
          <input v-model="search" class="input w-56" :placeholder="t('editor.search')" />
        </div>
        <div v-if="loadingOptions" class="py-6"><Spinner /></div>
        <Transition name="tab-fade" mode="out-in">
          <div v-if="!loadingOptions && tab==='teachers'" key="t">
            <div v-if="!filteredTeachers.length" class="text-sm text-gray-500">{{ t('editor.noTeachers') }}</div>
            <div v-else class="space-y-3 max-h-72 overflow-auto pr-1">
              <!-- Free teachers -->
              <div v-if="teachersFree.length">
                <div class="text-xs text-gray-500 mb-1">{{ t('editor.freeSection') }}</div>
                <div class="space-y-2">
                  <button
                    v-for="(tch,i) in teachersFree"
                    :key="'tf'+i"
                    class="btn-secondary w-full justify-between transition-colors duration-200 hover:bg-blue-50"
                    @click="onTeacherOption(tch)"
                  >
                    <span class="flex items-center gap-2">
                      <span>{{ tch.teacher_name }}</span>
                      <span v-if="tch.source && tch.source !== 'busy'" class="ml-1 text-xs px-2 py-0.5 rounded-full" :class="teacherSourceClass(tch.source)">{{ teacherSourceLabel(tch.source) }}</span>
                    </span>
                  </button>
                </div>
              </div>
              <!-- Busy teachers -->
              <div v-if="teachersBusy.length">
                <div class="text-xs text-gray-500 mt-2 mb-1">{{ t('editor.busySection') }}</div>
                <div class="space-y-2">
                  <div
                    v-for="(tch,i) in teachersBusy"
                    :key="'tb'+i"
                    class="border rounded-md p-2 bg-white/60"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{{ tch.teacher_name }}</span>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{{ t('editor.busy') }}</span>
                        <span v-if="tch.conflicts_count && tch.conflicts_count>0" class="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{{ t('editor.conflicts') }}: {{ tch.conflicts_count }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button class="btn-xs btn-secondary" @click="openTeacherSwap(tch.teacher_name)">{{ t('editor.swapPlan') }}</button>
                        <button class="btn-xs btn-primary" @click="openTeacherSwap(tch.teacher_name)">{{ t('editor.assignAnyway') }}</button>
                      </div>
                    </div>
                    <div v-if="tch.busy_groups?.length" class="mt-1 text-xs text-gray-600">
                      {{ t('editor.busyGroups') }}: {{ tch.busy_groups.join(', ') }}
                    </div>
                    <div v-if="tch.conflicts?.length" class="mt-1">
                      <div class="text-[11px] text-gray-500">{{ t('editor.conflictsList') }}</div>
                      <ul class="text-xs text-gray-700 list-disc list-inside">
                        <li v-for="(c,j) in tch.conflicts" :key="'tconf'+j">{{ c.group_name }} • {{ c.subject_name }} • {{ c.room_name }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!loadingOptions && tab==='rooms'" key="r">
            <div v-if="!filteredRooms.length" class="text-sm text-gray-500">{{ t('editor.noRooms') }}</div>
            <div v-else class="space-y-3 max-h-72 overflow-auto pr-1">
              <!-- Free rooms -->
              <div v-if="roomsFree.length">
                <div class="text-xs text-gray-500 mb-1">{{ t('editor.freeSection') }}</div>
                <div class="space-y-2">
                  <button
                    v-for="(r,i) in roomsFree"
                    :key="'rf'+i"
                    class="btn-secondary w-full justify-between transition-colors duration-200 hover:bg-blue-50"
                    @click="tryRoom(r.room_name)"
                  >
                    <span class="flex items-center gap-2">
                      <span>{{ r.room_name }}</span>
                    </span>
                    <span class="flex items-center gap-2">
                      <span v-if="typeof r.capacity === 'number'" class="text-xs text-gray-600">{{ r.capacity }}</span>
                    </span>
                  </button>
                </div>
              </div>
              <!-- Busy rooms -->
              <div v-if="roomsBusy.length">
                <div class="text-xs text-gray-500 mt-2 mb-1">{{ t('editor.busySection') }}</div>
                <div class="space-y-2">
                  <div v-for="(r,i) in roomsBusy" :key="'rb'+i" class="border rounded-md p-2 bg-white/60">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{{ r.room_name }}</span>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{{ t('editor.busy') }}</span>
                        <span v-if="typeof r.used==='number' && typeof r.capacity==='number'" class="text-xs text-gray-600">{{ r.used }}/{{ r.capacity }}</span>
                        <span v-else-if="typeof r.conflicts_count==='number'" class="text-xs text-gray-600">{{ r.conflicts_count }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button class="btn-xs btn-secondary" @click="tryRoom(r.room_name)">{{ t('editor.swapPlan') }}</button>
                        <button class="btn-xs btn-primary" @click="forceSwapToRoom(r.room_name)">{{ t('editor.assignAnyway') }}</button>
                      </div>
                    </div>
                    <div v-if="r.occupied_by?.length" class="mt-1">
                      <div class="text-[11px] text-gray-500">{{ t('editor.occupiedBy') }}</div>
                      <ul class="text-xs text-gray-700 list-disc list-inside">
                        <li v-for="(o,j) in r.occupied_by" :key="'rocc'+j">{{ o.group_name }} • {{ o.subject_name }} • {{ o.teacher_name }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <template #actions>
        <button class="btn-secondary" @click="closeOptions">{{ t('editor.close') }}</button>
      </template>
    </Modal>

    <!-- Modal for teacher swap plan / auto resolve -->
    <Modal :open="!!teacherPlan" :title="`Замена преподавателя: ${teacherPlan?.desired_teacher_name || ''}`" @close="teacherPlan = null">
      <div v-if="teacherPlan">
        <div class="text-xs text-yellow-800 bg-yellow-50 p-2 rounded mb-2">
          Важно: при смене преподавателя предмет может измениться по маппингу группа–преподаватель–предмет.
        </div>
        <div v-if="teacherPlan.is_free" class="text-sm text-green-700">Преподаватель свободен — будет применён напрямую.</div>
        <div v-else>
          <div class="text-sm mb-2" :class="teacherPlan.can_auto_resolve ? 'text-yellow-700' : 'text-red-700'">
            Конфликтов: {{ teacherPlan.conflicts?.length || 0 }} • Авторазрешение: {{ teacherPlan.can_auto_resolve ? 'возможно' : 'нет' }}
          </div>
          <div class="space-y-2 max-h-64 overflow-auto">
            <div v-for="(c,i) in (teacherPlan.conflicts || [])" :key="i" class="border rounded p-2 text-sm">
              <div class="font-medium">entry {{ c.entry_id }} — {{ c.group_name }} • {{ c.subject_name }} • {{ c.teacher_name }}</div>
              <div class="mt-1 flex items-center gap-2">
                <label class="text-xs text-gray-600">Альтернатива</label>
                <select class="input" v-model="teacherChoicesMap[c.entry_id]">
                  <option v-for="(alt,j) in c.alternatives || []" :key="j" :value="alt">{{ alt }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #actions>
        <button class="btn-secondary" @click="previewTeacherSwap" :disabled="!entryForOptions || !teacherPlan">Предпросмотр</button>
        <button class="btn-primary" @click="applyTeacherSwap" :disabled="!entryForOptions || !teacherPlan">Применить</button>
        <button class="btn-secondary" @click="teacherPlan = null">{{ t('editor.close') }}</button>
      </template>
    </Modal>

    <!-- Modal for room swap plan / auto resolve -->
    <Modal :open="!!swapPlan" :title="`${t('editor.freeRoomTitle')}: ${swapPlan?.desired_room_name || ''}`" @close="swapPlan = null">
      <div v-if="swapPlan">
        <div v-if="swapPlan.is_free" class="text-sm text-green-700">{{ t('editor.roomIsFree') }}</div>
        <div v-else>
          <div class="text-sm mb-2" :class="swapPlan.can_auto_resolve ? 'text-yellow-700' : 'text-red-700'">
            {{ t('editor.conflicts') }}: {{ swapPlan.conflicts?.length || 0 }} • {{ t('editor.autoResolve') }}: {{ swapPlan.can_auto_resolve ? t('editor.possible') : t('editor.no') }}
          </div>
          <div class="space-y-2 max-h-64 overflow-auto">
            <div v-for="(c,i) in (swapPlan.conflicts || [])" :key="i" class="border rounded p-2 text-sm">
              <div class="font-medium">entry {{ c.entry_id }} — {{ c.group_name }} • {{ c.subject_name }} • {{ c.teacher_name }} • {{ c.room_name }}</div>
              <div class="mt-1 flex items-center gap-2">
                <label class="text-xs text-gray-600">{{ t('editor.alternatives') }}</label>
                <select class="input" v-model="roomChoicesMap[c.entry_id]">
                  <option v-for="(alt,j) in c.alternatives || []" :key="j" :value="alt">{{ alt }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #actions>
        <button class="btn-secondary" @click="previewSwap" :disabled="!entryForOptions || !swapPlan">{{ t('editor.preview') }}</button>
        <button class="btn-primary" @click="applySwap" :disabled="!entryForOptions || !swapPlan">{{ t('editor.auto') }}</button>
        <button class="btn-secondary" @click="swapPlan = null">{{ t('editor.close') }}</button>
      </template>
    </Modal>

    <!-- Modal: Add entry manual -->
    <Modal :open="showAdd" :title="t('editor.addEntry') as string" @close="closeAddModal">
      <div class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-600">{{ t('common.date') }}</label>
            <DatePicker v-model="addForm.date" />
          </div>
          <div>
            <label class="text-xs text-gray-600">{{ t('common.group') }}</label>
            <input v-model="addForm.group_name" class="input" :placeholder="t('editor.groupPlaceholder')" />
          </div>
          <div>
            <label class="text-xs text-gray-600">{{ t('common.startTime') }}</label>
            <input v-model="addForm.start_time" class="input" type="time" />
          </div>
          <div>
            <label class="text-xs text-gray-600">{{ t('common.endTime') }} ({{ t('editor.optional') }})</label>
            <input v-model="addForm.end_time" class="input" type="time" />
          </div>
          <div>
            <label class="text-xs text-gray-600 flex items-center justify-between">
              <span>{{ t('common.subject') }}</span>
              <button class="btn-xs btn-secondary" @click="fillFromPlanInAdd" type="button">{{ t('editor.fillFromPlan') }}</button>
            </label>
            <input v-model="addForm.subject_name" class="input" list="add-subjects-list" />
            <datalist id="add-subjects-list">
              <option v-for="(s, i) in subjectOptions" :key="'s'+i" :value="s" />
            </datalist>
          </div>
          <div>
            <label class="text-xs text-gray-600">{{ t('common.room') }}</label>
            <input v-model="addForm.room_name" class="input" list="add-rooms-list" />
            <datalist id="add-rooms-list">
              <option v-for="(s, i) in roomOptions" :key="'r'+i" :value="s" />
            </datalist>
          </div>
          <div class="md:col-span-2">
            <label class="text-xs text-gray-600">{{ t('common.teacher') }} ({{ t('editor.optional') }})</label>
            <input v-model="addForm.teacher_name" class="input" list="add-teachers-list" />
            <datalist id="add-teachers-list">
              <option v-for="(s, i) in teacherOptions" :key="'t'+i" :value="s" />
            </datalist>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" v-model="addForm.ignore_weekly_conflicts" /> {{ t('editor.ignoreWeeklyConflicts') }}</label>
          <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" v-model="addForm.allow_create_entities" /> {{ t('editor.allowCreateEntities') }}</label>
        </div>
      </div>
      <template #actions>
        <button class="btn-primary" :disabled="adding" @click="submitAdd">{{ t('editor.addEntry') }}</button>
        <button class="btn-secondary" @click="closeAddModal">{{ t('editor.close') }}</button>
      </template>
    </Modal>

    <!-- Modal: Edit entry -->
    <Modal :open="showEdit" :title="t('editor.edit') as string" @close="closeEdit">
      <div class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-gray-600">{{ t('common.subject') }}</label>
            <input v-model="editForm.subject_name" class="input" />
          </div>
          <div>
            <label class="text-xs text-gray-600">{{ t('common.teacher') }}</label>
            <input v-model="editForm.teacher_name" class="input" />
          </div>
          <div>
            <label class="text-xs text-gray-600">{{ t('common.room') }}</label>
            <input v-model="editForm.room_name" class="input" />
          </div>
        </div>
      </div>
      <template #actions>
        <button class="btn-primary" @click="submitEdit">{{ t('common.save') || 'Сохранить' }}</button>
        <button class="btn-secondary" @click="closeEdit">{{ t('editor.close') }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import DatePicker from '@/components/common/DatePicker.vue'
import Modal from '@/components/common/Modal.vue'
import { api } from '@/services/api'
import type { DayData, ScheduleEntry, EntryOptions, RoomSwapPlan, DayReport, TeacherSwapPlan } from '@/types/schedule'
import { todayYMD, weekRange } from '@/utils/format'
import { useI18n } from 'vue-i18n'
import { useDebounce } from '@/composables/useDebounce'
import Spinner from '@/components/common/Spinner.vue'
const { t } = useI18n()

const date = ref<string>(todayYMD())
const groupName = ref<string>('')
const loading = ref(false)
const day = ref<DayData | null>(null)
const noDay = ref(false)
const isToday = computed(() => date.value === todayYMD())
const dayReportData = ref<DayReport | null>(null)
const lastOpReport = ref<any | null>(null)

const opts = reactive({
  from_plan: true,
  enforce_no_gaps: true,
  allow_repeated_subjects: true,
  max_repeats_per_subject: 3,
  max_pairs_per_day: 4,
  use_both_shifts: false,
})
const showBars = ref(true)
const viewMode = ref<'table'|'cards'>('table')

// Autofill state
const autofill = reactive({
  ensure_pairs_per_day: 2,
  allow_repeated_subjects: false,
  max_repeats_per_subject: 2,
  use_both_shifts: false,
})

// Removed day lookup UI and logic

async function refresh() {
  if (!date.value) return
  loading.value = true
  try {
    const res = await api.getDay({ date: date.value, group_name: groupName.value || undefined })
    day.value = res
    noDay.value = false
    if (day.value?.id) dayReportData.value = await api.dayReport(day.value.id)
  } catch (e: any) {
    const status = e?.response?.status
    // If no day exists for the selected date -> show friendly message
    if (status === 404) {
      day.value = null
      noDay.value = true
    } else {
      // keep previous state; error already surfaced by global handler
    }
  } finally { loading.value = false }
}

async function buildPlan() {
  if (!date.value) return
  loading.value = true
  try {
    const payload: any = { date: date.value, group_name: groupName.value || undefined, ...opts }
    await api.scheduleDayPlan(payload)
    await refresh()
  } finally { loading.value = false }
}

async function approve() {
  if (!day.value?.id) return
  // Frontend guard: prevent approval if there are entries without room
  const missingRooms = (day.value?.entries || []).filter(e => !e.room_name || !e.room_name.toString().trim()).length
  if (missingRooms > 0) {
    alert(t('editor.cannotApproveEmptyRooms') as string)
    return
  }
  loading.value = true
  try {
    await api.approveDayV2(day.value.id, { record_progress: true, enforce_no_blockers: true, group_name: groupName.value || undefined })
    await refresh()
  } catch (e: any) {
    const msg = e?.response?.data?.detail || 'Не удалось утвердить день'
    alert(msg)
  } finally { loading.value = false }
}

async function downloadExcel() {
  if (!date.value) return
  const blob = await api.exportDay({ date: date.value, groups: groupName.value ? [groupName.value] : undefined })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `day_${date.value}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

async function runAutofill() {
  if (!date.value) return
  loading.value = true
  try {
    const payload: any = {
      date: date.value,
      group_name: groupName.value || undefined,
      ensure_pairs_per_day: autofill.ensure_pairs_per_day,
      allow_repeated_subjects: autofill.allow_repeated_subjects,
      max_repeats_per_subject: autofill.max_repeats_per_subject,
      use_both_shifts: autofill.use_both_shifts,
      ignore_weekly_conflicts: true,
    }
    const res = await api.autofillMinPairs(payload)
    lastOpReport.value = (res && res.report) || null
    await refresh()
  } finally { loading.value = false }
}

function sorted(list: ScheduleEntry[]) {
  return [...(list || [])].sort((a, b) => {
    const g = (a.group_name || '').localeCompare(b.group_name || '')
    if (g !== 0) return g
    return (a.start_time || '').localeCompare(b.start_time || '')
  })
}
const onlyDiffs = ref(false)
const onlyApproved = ref(false)
const onlyEmptyRooms = ref(false)
function filteredSorted(list: ScheduleEntry[], mode: 'actual'|'plan') {
  let arr = sorted(list)
  if (onlyApproved.value) arr = arr.filter(e => (e.approval_status || '').toString() === 'approved')
  if (!onlyDiffs.value) return arr
  return arr.filter(e => {
    const d = diffForEntry(e, mode)
    if (!d) return false
    return d.type !== 'same'
  })
}
function diffClass(t: string) {
  if (t === 'added') return 'bg-green-50 border-green-200 text-green-800'
  if (t === 'removed') return 'bg-red-50 border-red-200 text-red-800'
  if (t === 'changed') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  return 'bg-gray-50 border-gray-200 text-gray-700'
}

const diffMap = computed(() => {
  const m = new Map<string, any>()
  const diffs = day.value?.differences || []
  for (const d of diffs) {
    const key = `${d.group_name}__${d.start_time}`
    m.set(key, d)
  }
  return m
})
function diffForEntry(e: ScheduleEntry, mode: 'actual'|'plan') {
  const key = `${e.group_name}__${e.start_time}`
  const d = diffMap.value.get(key)
  if (!d) return null
  return d
}
function entryBoxClass(e: ScheduleEntry, mode: 'actual'|'plan') {
  const d = diffForEntry(e, mode)
  if (!d) return ''
  if (mode === 'actual') {
    if (d.type === 'added') return 'border-l-4 border-green-400 bg-green-50'
    if (d.type === 'changed') return 'border-l-4 border-yellow-400 bg-yellow-50'
  } else {
    if (d.type === 'removed') return 'border-l-4 border-red-400 bg-red-50'
    if (d.type === 'changed') return 'border-l-4 border-yellow-400 bg-yellow-50'
  }
  return ''
}
function chips(e: ScheduleEntry, mode: 'actual'|'plan') {
  const d = diffForEntry(e, mode)
  const res: { label: string; class: string }[] = []
  if (!d) return res
  const cls = 'bg-yellow-100 text-yellow-700'
  if (d.type === 'added' && mode === 'actual') res.push({ label: t('editor.addedShort'), class: 'bg-green-100 text-green-700' })
  if (d.type === 'removed' && mode === 'plan') res.push({ label: t('editor.removedShort'), class: 'bg-red-100 text-red-700' })
  if (d.type === 'changed') {
    if (d.plan_subject !== d.actual_subject) res.push({ label: t('common.subject'), class: cls })
    if (d.plan_teacher !== d.actual_teacher) res.push({ label: t('common.teacher'), class: cls })
    if (d.plan_room !== d.actual_room) res.push({ label: t('common.room'), class: cls })
  }
  return res
}
function entryKey(e: ScheduleEntry, i: number) {
  return e.entry_id ?? `${e.date}-${e.start_time}-${e.end_time}-${e.group_name}-${e.subject_name}-${i}`
}

// Status badges
function statusCategory(raw: string | null | undefined) {
  const s = (raw || 'planned').toString()
  if (s.startsWith('replaced')) return 'replaced'
  if (s === 'approved') return 'approved'
  if (s === 'pending' || s === 'planned' || s === 'draft') return 'planned'
  return 'planned'
}
function statusBadgeClass(raw: string | null | undefined) {
  const s = (raw || '').toString()
  if (s === 'approved') return 'bg-green-100 text-green-700'
  if (s === 'replaced_manual') return 'bg-blue-100 text-blue-700'
  if (s === 'replaced_auto') return 'bg-teal-100 text-teal-700'
  if (s.startsWith('replaced')) return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}
function statusLabel(raw: string | null | undefined) {
  const key = `status.${(raw || 'planned').toString()}`
  const tr = t(key)
  return tr !== key ? tr : (raw || 'planned')
}

// Replacement flow
const showOptions = ref(false)
const entryForOptions = ref<ScheduleEntry | null>(null)
const options = ref<EntryOptions | null>(null)
const tab = ref<'teachers'|'rooms'>('teachers')
const search = ref('')
const filteredTeachers = computed(() => {
  const list = options.value?.teachers || []
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(t => (t.teacher_name || '').toLowerCase().includes(q))
})
const teachersFree = computed(() => (filteredTeachers.value || []).filter(t => !t.busy))
const teachersBusy = computed(() => (filteredTeachers.value || []).filter(t => !!t.busy))
const filteredRooms = computed(() => {
  const list = options.value?.rooms || []
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(r => (r.room_name || '').toLowerCase().includes(q))
})
const roomsFree = computed(() => (filteredRooms.value || []).filter(r => !r.busy))
const roomsBusy = computed(() => (filteredRooms.value || []).filter(r => !!r.busy))

function openReplace(e: ScheduleEntry) {
  entryForOptions.value = e
  showOptions.value = true
  // If room is empty, open rooms tab by default
  const rn = (e.room_name || '').toString().trim()
  tab.value = rn ? 'teachers' : 'rooms'
  loadOptions()
}
function closeOptions() { showOptions.value = false; entryForOptions.value = null; options.value = null }
function tabClass(x: 'teachers'|'rooms') {
  return ['px-3 py-1 rounded-md text-sm transition-all duration-200', tab.value===x ? 'bg-blue-100 text-blue-800 shadow-sm' : 'text-gray-700 hover:bg-gray-100']
}

const loadingOptions = ref(false)
function entryId(e?: ScheduleEntry | null): number | undefined {
  if (!e) return undefined
  const anyE: any = e as any
  return (typeof e.entry_id === 'number' ? e.entry_id : undefined) ?? (typeof anyE.id === 'number' ? anyE.id : undefined)
}

async function loadOptions() {
  const id = entryId(entryForOptions.value)
  if (!id) return
  loadingOptions.value = true
  try { options.value = await api.getEntryOptions(id, { limit_teachers: 50, limit_rooms: 50 }) }
  finally { loadingOptions.value = false }
}

async function applyTeacher(name: string) {
  const id = entryId(entryForOptions.value)
  if (!id) return
  try {
    const res = await api.updateEntryManualV2({ entry_id: id, teacher_name: name })
    lastOpReport.value = (res && (res as any).report) || null
    await refresh()
    closeOptions()
  } catch (e) {
    try {
      const plan = await api.getTeacherSwapPlan(id, name)
      teacherPlan.value = plan as any
      teacherChoicesMap = reactive<Record<number, string>>({})
      for (const c of (teacherPlan.value?.conflicts || [])) {
        teacherChoicesMap[c.entry_id] = (c.alternatives?.[0] || '')
      }
    } catch {
      alert('Нельзя применить выбранного преподавателя (занят). Попробуйте другой вариант.')
    }
  }
}

// When user picks a teacher option: if busy -> open swap plan; else apply directly
async function onTeacherOption(tch: { teacher_name: string; busy?: boolean }) {
  const name = tch.teacher_name
  if (tch.busy) {
    await openTeacherSwap(name)
    return
  }
  await applyTeacher(name)
}

async function openTeacherSwap(name: string) {
  const id = entryId(entryForOptions.value)
  if (!id) return
  try {
    const plan = await api.getTeacherSwapPlan(id, name)
    teacherPlan.value = plan as any
    teacherChoicesMap = reactive<Record<number, string>>({})
    for (const c of (teacherPlan.value?.conflicts || [])) {
      teacherChoicesMap[c.entry_id] = (c.alternatives?.[0] || '')
    }
  } catch {
    alert('Нельзя применить выбранного преподавателя (занят). Попробуйте другой вариант.')
  }
}

// Room selection: try to swap plan if occupied
const swapPlan = ref<RoomSwapPlan | null>(null)
let roomChoicesMap = reactive<Record<number, string>>({})
async function tryRoom(roomName: string) {
  const id = entryId(entryForOptions.value)
  if (!id) return
  // Check plan first
  const plan = await api.getRoomSwapPlan(id, roomName)
  if (plan.is_free) {
    try {
      await api.updateEntryManualV2({ entry_id: id, room_name: roomName })
      await refresh()
      closeOptions()
    } catch (e) { alert('Нельзя поставить в эту аудиторию'); }
    return
  }
  swapPlan.value = plan
  roomChoicesMap = reactive<Record<number, string>>({})
  for (const c of (swapPlan.value?.conflicts || [])) {
    roomChoicesMap[c.entry_id] = (c.alternatives?.[0] || '')
  }
}


// One-click forced swap to desired busy room using first alternatives
async function forceSwapToRoom(roomName: string) {
  const id = entryId(entryForOptions.value)
  if (!id) return
  try {
    const plan = await api.getRoomSwapPlan(id, roomName)
    if (plan.is_free) {
      await api.updateEntryManualV2({ entry_id: id, room_name: roomName })
      await refresh()
      closeOptions()
      return
    }
    const conflicts = plan.conflicts || []
    // If any conflict has no alternatives -> open plan modal for manual resolution
    if (conflicts.some(c => !c.alternatives || c.alternatives.length === 0)) {
      swapPlan.value = plan
      roomChoicesMap = reactive<Record<number, string>>({})
      for (const c of (swapPlan.value?.conflicts || [])) roomChoicesMap[c.entry_id] = (c.alternatives?.[0] || '')
      return
    }
    const choices = conflicts.map(c => ({ entry_id: c.entry_id, room_name: c.alternatives![0] }))
    const res = await api.swapRoom(id, { desired_room_name: roomName, choices })
    lastOpReport.value = res?.report || null
    await refresh()
    swapPlan.value = null
    closeOptions()
  } catch (e: any) {
    // Fallback to plan modal on any failure
    tryRoom(roomName)
  }
}

async function previewSwap() {
  const id = entryId(entryForOptions.value)
  if (!id || !swapPlan.value) return
  const choices = Object.entries(roomChoicesMap)
    .filter(([, v]) => !!v)
    .map(([k, v]) => ({ entry_id: Number(k), room_name: v }))
  const res = await api.swapRoom(id, { desired_room_name: swapPlan.value.desired_room_name, choices, dry_run: true })
  alert(t('editor.previewList') + '\n' + res.changed.map(c => `${c.entry_id}: ${c.old_room} -> ${c.new_room}`).join('\n'))
}
async function applySwap() {
  const id = entryId(entryForOptions.value)
  if (!id || !swapPlan.value) return
  const choices = Object.entries(roomChoicesMap)
    .filter(([, v]) => !!v)
    .map(([k, v]) => ({ entry_id: Number(k), room_name: v }))
  const res = await api.swapRoom(id, { desired_room_name: swapPlan.value.desired_room_name, choices })
  lastOpReport.value = res?.report || null
  await refresh()
  swapPlan.value = null
  closeOptions()
}

// Teacher swap state and actions
const teacherPlan = ref<TeacherSwapPlan | null>(null)
let teacherChoicesMap = reactive<Record<number, string>>({})
async function previewTeacherSwap() {
  const id = entryId(entryForOptions.value)
  if (!id || !teacherPlan.value) return
  const choices = Object.entries(teacherChoicesMap)
    .filter(([, v]) => !!v)
    .map(([k, v]) => ({ entry_id: Number(k), teacher_name: v }))
  const res: any = await api.swapTeacher(id, { desired_teacher_name: teacherPlan.value.desired_teacher_name, choices, dry_run: true })
  alert((t('editor.previewList') as string) + '\n' + res.changed.map((c: any) => `${c.entry_id}: ${c.old_teacher || '—'} -> ${c.new_teacher}`).join('\n'))
}
async function applyTeacherSwap() {
  const id = entryId(entryForOptions.value)
  if (!id || !teacherPlan.value) return
  const choices = Object.entries(teacherChoicesMap)
    .filter(([, v]) => !!v)
    .map(([k, v]) => ({ entry_id: Number(k), teacher_name: v }))
  const res: any = await api.swapTeacher(id, { desired_teacher_name: teacherPlan.value.desired_teacher_name, choices })
  lastOpReport.value = res?.report || null
  await refresh()
  teacherPlan.value = null
  closeOptions()
}

// Clear current entry room via backend endpoint
async function clearCurrentEntryRoom() {
  const id = entryId(entryForOptions.value)
  if (!id) return
  try {
    await api.clearRoom(id)
    await refresh()
    closeOptions()
  } catch (e) {
    alert('Не удалось очистить аудиторию')
  }
}

// Teacher source badges
function teacherSourceLabel(src?: string) {
  if (!src) return ''
  if (src === 'group_subject_mapping') return 'по маппингу группы‑предмета'
  if (src === 'group_mapping') return 'по маппингу группы'
  if (src === 'free') return 'свободный любой'
  if (src === 'busy') return 'занят'
  return src
}
function teacherSourceClass(src?: string) {
  if (!src) return 'bg-gray-100 text-gray-600'
  if (src === 'group_subject_mapping') return 'bg-green-100 text-green-700'
  if (src === 'group_mapping') return 'bg-blue-100 text-blue-700'
  if (src === 'free') return 'bg-gray-100 text-gray-700'
  if (src === 'busy') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

onMounted(() => { refresh() })
// React to date/group changes: only GET refresh (no automatic POST)
const debouncedRefresh = useDebounce(() => refresh(), 400)
watch([date, groupName], () => { debouncedRefresh() })

async function replaceVacant() {
  if (!day.value?.id) return
  loading.value = true
  try {
    await api.replaceVacantAuto(day.value.id)
    await refresh()
  } finally { loading.value = false }
}

function pctWidth(actual?: number, plan?: number) {
  const a = actual || 0
  const p = plan || 0
  if (p <= 0) return '0%'
  return Math.min(100, Math.round((a / p) * 100)) + '%'
}

// Issues highlight (if report.issues present)
const issueLevelByEntryId = computed(() => {
  const m = new Map<number, 'blocker' | 'warning'>()
  const issues = (dayReportData.value as any)?.issues || []
  for (const it of issues) {
    const sev = (it.severity || '').toString()
    const ids = (it.entry_ids || []) as number[]
    for (const id of ids) {
      if (sev === 'blocker' || sev === 'warning') m.set(id, sev)
    }
  }
  return m
})
function entryIssueClass(e: ScheduleEntry) {
  const id = entryId(e)
  if (!id) return ''
  const sev = issueLevelByEntryId.value.get(id)
  if (sev === 'blocker') return 'ring-2 ring-red-400'
  if (sev === 'warning') return 'ring-2 ring-yellow-300'
  return ''
}

// Occupancy indicator for Спортзал
function slotOccupancyLabel(startTime: string) {
  const act = (day.value?.entries || []) as ScheduleEntry[]
  const count = act.filter(e => (e.start_time === startTime) && /Спортзал/i.test(e.room_name || '')).length
  if (count > 0) return `Спортзал: ${count}/4`
  return ''
}

// Aligned Plan vs Actual rows by group and time
const alignedRows = computed(() => {
  let plan = (day.value?.plan_entries || []) as ScheduleEntry[]
  let act = (day.value?.entries || []) as ScheduleEntry[]
  if (onlyApproved.value) {
    plan = plan.filter(e => (e.approval_status || '').toString() === 'approved')
    act = act.filter(e => (e.approval_status || '').toString() === 'approved')
  }
  const mapPlan = new Map<string, ScheduleEntry>()
  const mapAct = new Map<string, ScheduleEntry>()
  const keys = new Set<string>()
  for (const e of plan) { const k = `${e.group_name}__${e.start_time}`; mapPlan.set(k, e); keys.add(k) }
  for (const e of act) { const k = `${e.group_name}__${e.start_time}`; mapAct.set(k, e); keys.add(k) }
  const rows = Array.from(keys).map(k => {
    const [group_name, start_time] = k.split('__')
    return { group_name, start_time, plan: mapPlan.get(k), actual: mapAct.get(k) }
  })
  let filtered = rows
  if (onlyDiffs.value) {
    filtered = rows.filter(r => {
      const d = diffMap.value.get(`${r.group_name}__${r.start_time}`)
      return d && d.type !== 'same'
    })
  }
  if (onlyEmptyRooms.value) {
    filtered = filtered.filter(r => !!r.actual && (!(r.actual!.room_name) || !r.actual!.room_name.toString().trim()))
  }
  filtered.sort((a, b) => (a.group_name || '').localeCompare(b.group_name || '') || (a.start_time || '').localeCompare(b.start_time || ''))
  return filtered
})

function entryLabel(e?: ScheduleEntry | null) {
  if (!e) return '—'
  return `${e.subject_name} • ${e.teacher_name} • ${e.room_name}`
}

// Grouped view state
const openGroups = ref<Set<string>>(new Set())
const groupedRows = computed(() => {
  const groups = new Map<string, { group_name: string; rows: { group_name: string; start_time: string; plan?: ScheduleEntry | null; actual?: ScheduleEntry | null }[] }>()
  for (const r of alignedRows.value) {
    const g = groups.get(r.group_name) || { group_name: r.group_name, rows: [] }
    g.rows.push(r)
    groups.set(r.group_name, g)
    if (!openGroups.value.has(r.group_name)) openGroups.value.add(r.group_name)
  }
  return Array.from(groups.values()).sort((a, b) => a.group_name.localeCompare(b.group_name))
})
function toggleGroup(name: string) {
  const s = new Set(openGroups.value)
  if (s.has(name)) s.delete(name)
  else s.add(name)
  openGroups.value = s
}
function isOpen(name: string) { return openGroups.value.has(name) }
function groupReport(report: DayReport | null, name: string) {
  if (!report) return { blockers: [], warnings: [] }
  const blk = (report.blockers || []).filter(x => x.includes(name))
  const wrn = (report.warnings || []).filter(x => x.includes(name))
  return { blockers: blk, warnings: wrn }
}

function rowReport(r: { group_name: string; start_time: string }) {
  let b = 0, w = 0
  const tag = `${r.group_name}`
  const time = `${r.start_time}`
  const countIn = (rep: DayReport | null | undefined) => {
    if (!rep) return
    for (const s of (rep.blockers || [])) if (s.includes(tag) && s.includes(time)) b++
    for (const s of (rep.warnings || [])) if (s.includes(tag) && s.includes(time)) w++
  }
  countIn(dayReportData.value)
  if (lastOpReport.value) countIn(lastOpReport.value)
  return { b, w }
}

const analysisRows = computed(() => {
  const rows: { severity: 'blocker'|'warning'; message: string; group_name?: string; start_time?: string }[] = []
  const push = (severity: 'blocker'|'warning', message: string) => {
    let group_name: string | undefined
    let start_time: string | undefined
    // Guess group by presence in known groups
    const groups = new Set<string>([
      ...(day.value?.group_hours_summary || []).map(g => g.group_name),
      ...((day.value?.entries || []).map(e => e.group_name)),
      ...((day.value?.plan_entries || []).map(e => e.group_name)),
    ])
    for (const g of groups) { if (g && message.includes(g)) { group_name = g; break } }
    // Guess time by HH:MM in message
    const m = message.match(/\b(\d{2}:\d{2})\b/)
    if (m) start_time = m[1]
    rows.push({ severity, message, group_name, start_time })
  }
  const collect = (report: any) => {
    if (!report) return
    for (const s of (report.blockers || [])) push('blocker', String(s))
    for (const s of (report.warnings || [])) push('warning', String(s))
  }
  collect(dayReportData.value)
  collect(lastOpReport.value)
  return rows
})

// Inline edit modal
const showEdit = ref(false)
const editTarget = ref<ScheduleEntry | null>(null)
const editForm = reactive<{ subject_name: string; teacher_name: string; room_name: string }>({ subject_name: '', teacher_name: '', room_name: '' })
function openEdit(e: ScheduleEntry) {
  editTarget.value = e
  editForm.subject_name = e.subject_name || ''
  editForm.teacher_name = e.teacher_name || ''
  editForm.room_name = e.room_name || ''
  showEdit.value = true
}
function closeEdit() { showEdit.value = false; editTarget.value = null }
async function submitEdit() {
  const id = entryId(editTarget.value)
  if (!id) return
  try {
    const res = await api.updateEntryManualV2({
      entry_id: id,
      subject_name: editForm.subject_name || undefined,
      teacher_name: editForm.teacher_name || undefined,
      room_name: editForm.room_name || undefined,
    })
    lastOpReport.value = (res && (res as any).report) || null
    showEdit.value = false
    await refresh()
  } catch (e) {
    alert('Не удалось изменить запись')
  }
}

async function deleteEntry(e: ScheduleEntry) {
  const id = entryId(e)
  if (!id) return
  if (!confirm(t('editor.confirmDelete') as string)) return
  try {
    const res = await api.deleteDayEntry(id)
    lastOpReport.value = res?.report || null
    await refresh()
  } catch (err) {
    alert('Не удалось удалить запись')
  }
}

function addFromRow(row: { group_name: string; start_time: string; plan?: ScheduleEntry | null }) {
  openAddModal()
  addForm.date = date.value
  addForm.group_name = row.group_name || ''
  addForm.start_time = row.start_time || ''
  if (row.plan) {
    addForm.subject_name = row.plan.subject_name || ''
    addForm.room_name = row.plan.room_name || ''
    addForm.teacher_name = row.plan.teacher_name || ''
  }
}

// Add entry modal
const showAdd = ref(false)
const adding = ref(false)
const addForm = reactive<{ date: string; group_name: string; start_time: string; end_time?: string; subject_name: string; room_name: string; teacher_name?: string; ignore_weekly_conflicts: boolean; allow_create_entities: boolean }>(
  { date: todayYMD(), group_name: '', start_time: '', end_time: '', subject_name: '', room_name: '', teacher_name: '', ignore_weekly_conflicts: true, allow_create_entities: true }
)

const subjectOptions = ref<string[]>([])
const teacherOptions = ref<string[]>([])
const roomOptions = ref<string[]>([])
const addAutoDefaults = ref<{ teacher_name?: string; room_name?: string; end_time?: string } | null>(null)
const addManualOverride = ref(false)

function recomputeGroupOptions() {
  const group = addForm.group_name?.trim()
  const plan = (day.value?.plan_entries || []) as ScheduleEntry[]
  const subjects = new Set<string>()
  const teachers = new Set<string>()
  const rooms = new Set<string>()
  for (const e of plan) {
    if (!group || e.group_name === group) {
      if (e.subject_name) subjects.add(e.subject_name)
      if (e.teacher_name) teachers.add(e.teacher_name)
      if (e.room_name) rooms.add(e.room_name)
    }
  }
  subjectOptions.value = Array.from(subjects)
  teacherOptions.value = Array.from(teachers)
  roomOptions.value = Array.from(rooms)
}

watch(() => addForm.group_name, () => {
  recomputeGroupOptions()
})

// As user types, fetch extra options and merge (subjects/teachers)
const fetchOptionsDebounced = useDebounce(async () => {
  const subjQ = (addForm.subject_name || '').trim()
  if (subjQ.length >= 2) {
    try {
      const arr = await api.dictSubjects(subjQ)
      const set = new Set(subjectOptions.value)
      for (const it of arr) set.add(it.value)
      subjectOptions.value = Array.from(set)
    } catch {}
  }
  const teachQ = (addForm.teacher_name || '').trim()
  if (teachQ.length >= 2) {
    try {
      const arr = await api.dictTeachers(teachQ)
      const set = new Set(teacherOptions.value)
      for (const it of arr) set.add(it.value)
      teacherOptions.value = Array.from(set)
    } catch {}
  }
  const roomQ = (addForm.room_name || '').trim()
  if (roomQ.length >= 2) {
    try {
      const arr = await api.dictRooms(roomQ)
      const set = new Set(roomOptions.value)
      for (const it of arr) set.add(it.value)
      roomOptions.value = Array.from(set)
    } catch {}
  }
}, 400)

watch(() => addForm.subject_name, () => fetchOptionsDebounced())
watch(() => addForm.teacher_name, () => fetchOptionsDebounced())
watch(() => addForm.room_name, () => fetchOptionsDebounced())
watch(() => addForm.start_time, () => applyAutoFromPlan())
watch(() => addForm.group_name, () => applyAutoFromPlan())

// Track manual overrides relative to auto defaults
watch(() => addForm.teacher_name, (v) => {
  if (!addAutoDefaults.value) return
  addManualOverride.value = addManualOverride.value || (v || '') !== (addAutoDefaults.value.teacher_name || '')
})
watch(() => addForm.room_name, (v) => {
  if (!addAutoDefaults.value) return
  addManualOverride.value = addManualOverride.value || (v || '') !== (addAutoDefaults.value.room_name || '')
})
watch(() => addForm.subject_name, () => {
  // Try auto-fill by subject whenever subject changes
  applyAutoFromPlan()
})

function fillFromPlanInAdd() {
  const group = addForm.group_name?.trim()
  const start = addForm.start_time?.trim()
  const plan = (day.value?.plan_entries || []) as ScheduleEntry[]
  let candidates = plan.filter(e => (!group || e.group_name === group))
  if (start) candidates = candidates.filter(e => e.start_time === start)
  candidates.sort((a,b) => a.start_time.localeCompare(b.start_time))
  const e = candidates[0]
  if (!e) return
  addForm.subject_name = e.subject_name || ''
  addForm.teacher_name = e.teacher_name || ''
  addForm.room_name = e.room_name || ''
  addForm.end_time = e.end_time || ''
  addAutoDefaults.value = { teacher_name: addForm.teacher_name, room_name: addForm.room_name, end_time: addForm.end_time }
  addManualOverride.value = false
}

function applyAutoFromPlan() {
  const group = addForm.group_name?.trim()
  const subj = addForm.subject_name?.trim()
  if (!group || !subj) return
  const start = addForm.start_time?.trim()
  const plan = (day.value?.plan_entries || []) as ScheduleEntry[]
  let candidates = plan.filter(e => e.group_name === group && e.subject_name === subj)
  if (start) candidates = candidates.filter(e => e.start_time === start)
  candidates.sort((a,b) => a.start_time.localeCompare(b.start_time))
  const e = candidates[0]
  if (!e) return
  addForm.teacher_name = e.teacher_name || addForm.teacher_name
  addForm.room_name = e.room_name || addForm.room_name
  addForm.end_time = e.end_time || addForm.end_time
  addAutoDefaults.value = { teacher_name: addForm.teacher_name, room_name: addForm.room_name, end_time: addForm.end_time }
  addManualOverride.value = false
}

async function hydrateGroupDicts() {
  const group = (addForm.group_name || '').trim()
  if (!group || !date.value) return
  try {
    const { start, end } = weekRange(addForm.date || date.value)
    const items = await api.scheduleQuery({ start_date: start, end_date: end, group_name: group })
    const subj = new Set(subjectOptions.value)
    const teach = new Set(teacherOptions.value)
    const rooms = new Set(roomOptions.value)
    for (const e of items) {
      if (e.subject_name) subj.add(e.subject_name)
      if (e.teacher_name) teach.add(e.teacher_name)
      if (e.room_name) rooms.add(e.room_name)
    }
    subjectOptions.value = Array.from(subj)
    teacherOptions.value = Array.from(teach)
    roomOptions.value = Array.from(rooms)
  } catch {}
}

function openAddModal() {
  addForm.date = date.value
  addForm.group_name = groupName.value || ''
  addForm.start_time = ''
  addForm.end_time = ''
  addForm.subject_name = ''
  addForm.room_name = ''
  addForm.teacher_name = ''
  addForm.ignore_weekly_conflicts = true
  addForm.allow_create_entities = true
  showAdd.value = true
  recomputeGroupOptions()
  hydrateGroupDicts()
}
function closeAddModal() { showAdd.value = false }

async function submitAdd() {
  // simple validations
  if (!addForm.date || !addForm.group_name || !addForm.start_time || !addForm.subject_name || !addForm.room_name) {
    alert('Заполните обязательные поля: дата, группа, начало, предмет, аудитория')
    return
  }
  if (addManualOverride.value) {
    const ok = confirm('Вы изменили автоподстановку. Точно применить эти значения?')
    if (!ok) return
  }
  adding.value = true
  try {
    const payload: any = {
      date: addForm.date,
      group_name: addForm.group_name,
      start_time: addForm.start_time,
      subject_name: addForm.subject_name,
      room_name: addForm.room_name,
    }
    if (addForm.end_time) payload.end_time = addForm.end_time
    if (addForm.teacher_name) payload.teacher_name = addForm.teacher_name
    payload.ignore_weekly_conflicts = !!addForm.ignore_weekly_conflicts
    payload.allow_create_entities = !!addForm.allow_create_entities
    await api.addEntryManual(payload)
    showAdd.value = false
    await refresh()
  } catch (e: any) {
    alert((e?.response?.data?.detail) || 'Не удалось добавить пару')
  } finally { adding.value = false }
}
</script>

<style scoped>
.badge { @apply inline-flex items-center px-2 py-0.5 rounded text-xs font-medium; }
.btn-xs { @apply text-xs px-2 py-1 rounded; }
.fade-move-enter-active, .fade-move-leave-active, .fade-move-move { transition: all 0.25s ease; }
.fade-move-enter-from, .fade-move-leave-to { opacity: 0; transform: translateY(4px); }
.tab-fade-enter-active, .tab-fade-leave-active { transition: all 0.2s ease; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; transform: translateY(4px); }
</style>

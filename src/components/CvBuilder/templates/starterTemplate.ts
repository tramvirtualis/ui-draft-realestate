import type { CvTemplateConfig } from "../../../types/job/cvTemplate.types";

/** Mẫu khởi đầu cho admin khi tạo mẫu CV mới: 2 cột, cột trái màu chủ đạo */

export const STARTER_HTML = `<div class="cv">
  <aside class="side">
    {{#if personal.avatarUrl}}
      <img class="avatar" src="{{personal.avatarUrl}}" alt="{{personal.fullName}}" />
    {{else}}
      <div class="avatar avatar--text">{{personal.initials}}</div>
    {{/if}}
    <h1 class="name">{{#if personal.fullName}}{{cvEdit "personal.fullName"}}{{else}}Họ và tên{{/if}}</h1>
    <p class="title">{{cvEdit "personal.title"}}</p>

    {{#if contacts.length}}
      <h2 class="side-heading">Liên hệ</h2>
      <ul class="contacts">
        {{#each contacts}}<li><span class="label">{{label}}</span>{{cvEdit "value"}}</li>{{/each}}
      </ul>
    {{/if}}

    {{#if skills.length}}
      <h2 class="side-heading">Kỹ năng</h2>
      {{#each skills}}
        <p class="small">{{cvEdit "name"}}</p>
      {{/each}}
    {{/if}}

    {{#if languages.length}}
      <h2 class="side-heading">Ngôn ngữ</h2>
      {{#each languages}}<p class="small">{{cvEdit "name"}} — {{cvEdit "level"}}</p>{{/each}}
    {{/if}}
  </aside>

  <main class="main">
    {{#each sections}}
      {{#unless (or is.skills is.languages)}}
        <section class="section">
          <h2 class="heading">{{title}}</h2>

          {{#if is.objective}}<p class="pre">{{cvEdit "objective" multiline=true}}</p>{{/if}}

          {{#if is.achievements}}
            <div class="stats">
              <div><b>{{@root.achievements.revenueBillion}} tỷ</b><span>Doanh số</span></div>
              <div><b>{{@root.achievements.projectCount}}</b><span>Dự án</span></div>
              <div><b>{{@root.achievements.closeRate}}%</b><span>Tỷ lệ chốt</span></div>
            </div>
          {{/if}}

          {{#if is.experience}}
            {{#each @root.experience}}
              <div class="item">
                <div class="item-head"><b>{{cvEdit "position"}}</b><span>{{period}}</span></div>
                <p class="muted">{{cvEdit "company"}}</p>
                <ul>{{#each bulletItems}}<li>{{cvEdit "text" multiline=true}}</li>{{/each}}</ul>
              </div>
            {{/each}}
          {{/if}}

          {{#if is.projects}}
            {{#each @root.projects}}
              <div class="item">
                <div class="item-head"><b>{{cvEdit "name"}}</b><span>{{period}}</span></div>
                <p class="muted">{{cvEdit "role"}}</p>
                <p class="pre">{{cvEdit "description" multiline=true}}</p>
              </div>
            {{/each}}
          {{/if}}

          {{#if is.education}}
            {{#each @root.education}}
              <div class="item">
                <div class="item-head"><b>{{cvEdit "school"}}</b><span>{{period}}</span></div>
                <p class="muted">{{cvEdit "major"}}</p>
              </div>
            {{/each}}
          {{/if}}

          {{#if is.certificates}}
            <ul>{{#each @root.certificates}}<li><b>{{cvEdit "name"}}</b> — {{cvEdit "issuer"}} {{#if year}}({{cvEdit "year"}}){{/if}}</li>{{/each}}</ul>
          {{/if}}

          {{#if is.references}}
            {{#each @root.references}}
              <p><b>{{cvEdit "name"}}</b> — {{cvEdit "position"}}, {{cvEdit "company"}}<br /><span class="muted">{{cvEdit "phone"}}{{#if (and phone email)}} · {{/if}}{{cvEdit "email"}}</span></p>
            {{/each}}
          {{/if}}

          {{#if is.custom}}
            {{#with custom}}<p class="pre">{{cvEdit "content" multiline=true}}</p>{{/with}}
          {{/if}}
        </section>
      {{/unless}}
    {{/each}}
  </main>
</div>`;

export const STARTER_CSS = `/* Mọi selector chỉ áp trong vùng CV. Dùng var(--cv-color), var(--cv-font), var(--cv-size) để ăn theo lựa chọn của người dùng */
.cv {
  display: flex;
  color: #1f2937;
  /* Cột trái kéo dài hết số trang A4 khi in */
  min-height: calc(297mm * var(--cv-pages, 1) - 0.5mm);
  background: linear-gradient(to right, var(--cv-color) 33%, #fff 33%);
}
.side { width: 33%; padding: 32px 20px; color: #fff; }
.main { flex: 1; min-width: 0; padding: 32px 24px; }

.avatar { display: block; width: 96px; height: 96px; margin: 0 auto; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,.3); }
.avatar--text { display: flex; align-items: center; justify-content: center; font-size: 2em; font-weight: 700; background: rgba(255,255,255,.15); }
.name { margin-top: 16px; text-align: center; font-size: 1.5em; font-weight: 700; text-transform: uppercase; line-height: 1.2; }
.title { text-align: center; font-size: .8em; text-transform: uppercase; letter-spacing: .05em; opacity: .85; }

.side-heading { margin-top: 20px; padding-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,.3); font-size: .85em; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.contacts { margin-top: 8px; font-size: .85em; word-break: break-all; }
.contacts li { margin-bottom: 6px; }
.contacts .label { display: block; font-size: .8em; opacity: .7; }
.pre { white-space: pre-line; }
.skill { margin-top: 8px; font-size: .85em; }
.bar { height: 4px; margin-top: 3px; border-radius: 4px; background: rgba(255,255,255,.25); }
.bar div { height: 100%; border-radius: 4px; background: #fff; }
.small { margin-top: 6px; font-size: .85em; }

.section + .section { margin-top: 20px; }
.heading { padding-bottom: 4px; border-bottom: 2px solid var(--cv-color); color: var(--cv-color); font-size: 1em; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.section > :not(.heading) { margin-top: 8px; }
.item + .item { margin-top: 12px; }
.item-head { display: flex; justify-content: space-between; gap: 12px; }
.item-head span, .muted { color: #6b7280; font-size: .85em; }
.item ul, .section > ul { margin-top: 4px; padding-left: 18px; list-style: disc; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.stats div { padding: 8px; border-radius: 8px; text-align: center; background: #f5f3ff; }
.stats b { display: block; color: var(--cv-color); font-size: 1.3em; }
.stats span { font-size: .75em; color: #6b7280; }`;

export const STARTER_CONFIG: CvTemplateConfig = {
  color: "var(--color-primary-700)",
  font: "Inter",
  fontSize: 13,
};

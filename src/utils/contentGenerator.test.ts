import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORE_PAIN_PRESETS,
  enforceChiefEditorFormatting,
  auditEditorialCompliance,
  buildEditorialMultipost,
} from './contentGenerator.ts';

test('enforceChiefEditorFormatting replaces all em-dashes and en-dashes with standard hyphen', () => {
  const input = 'Тестовый текст — с длинным тире и еще – таким тире.';
  const result = enforceChiefEditorFormatting(input);
  assert.equal(/[—–]/.test(result), false);
  assert.ok(result.includes(' - '));
});

test('auditEditorialCompliance flags long dashes, cliches, and missing CTA', () => {
  const badText = 'В современном мире — это ключевой аспект без призыва.';
  const audit = auditEditorialCompliance(badText);
  assert.equal(audit.passed, false);
  assert.equal(audit.hasForbiddenDashes, true);
  assert.equal(audit.hasTargetCta, false);
  assert.ok(audit.issues.length >= 2);
});

test('buildEditorialMultipost generates compliant 4-channel content for all 4 core pains', () => {
  assert.equal(CORE_PAIN_PRESETS.length, 4);

  for (const preset of CORE_PAIN_PRESETS) {
    const bundle = buildEditorialMultipost(preset.id);
    assert.ok(bundle.topic.length > 10);

    const channels = [
      bundle.versions.telegram,
      bundle.versions.vk,
      bundle.versions.dzen,
      bundle.versions.instagram,
    ];

    for (const channelText of channels) {
      const audit = auditEditorialCompliance(channelText);
      assert.equal(
        audit.passed,
        true,
        `Channel text for ${preset.id} failed audit: ${audit.issues.join('; ')}`
      );
      assert.equal(audit.hasForbiddenDashes, false);
      assert.equal(audit.longParagraphsCount, 0);
      assert.equal(audit.hasTargetCta, true);
    }
  }
});

test('core pain presets cover privacy leak, print (22).pdf, Ctrl+P raster, and 10-14 day senior MVP', () => {
  const privacy = buildEditorialMultipost('cloud_privacy_leak');
  assert.ok(privacy.versions.telegram.includes('100% локально'));

  const print22 = buildEditorialMultipost('print_22_chaos');
  assert.ok(print22.versions.telegram.includes('print (22).pdf'));
  assert.ok(print22.versions.telegram.includes('H1'));

  const ctrlP = buildEditorialMultipost('ctrl_p_broken_layout');
  assert.ok(ctrlP.versions.telegram.includes('Ctrl+P'));
  assert.ok(ctrlP.versions.telegram.includes('растр'));

  const agency = buildEditorialMultipost('agency_vs_senior_mvp');
  assert.ok(agency.versions.telegram.includes('10-14 дней'));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as assert from 'assert';
import { window, commands } from 'vscode';
import { closeAllEditors } from '../utils';

interface QuickPickExpected {
	events: string[];
	activeItems: string[][];
	selectionItems: string[][];
	acceptedItems: string[][];
}

suite('window namespace tests', function () {

	suite('QuickInput tests', function () {
		teardown(closeAllEditors);

		test('createQuickPick, select second', function (_done) {
			let done = (err?: any) => {
				done = () => {};
				_done(err);
			};

			const quickPick = createQuickPick({
				events: ['active', 'active', 'selection', 'accept', 'hide'],
				activeItems: [['eins'], ['zwei']],
				selectionItems: [['zwei']],
				acceptedItems: [['zwei']],
			}, done);
			quickPick.items = ['eins', 'zwei', 'drei'].map(label => ({ label }));
			quickPick.show();

			(async () => {
				await commands.executeCommand('workbench.action.quickOpenSelectNext');
				await commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
			})()
				.catch(err => done(err));
		});

		test('createQuickPick, focus second', function (_done) {
			let done = (err?: any) => {
				done = () => {};
				_done(err);
			};

			const quickPick = createQuickPick({
				events: ['active', 'selection', 'accept', 'hide'],
				activeItems: [['zwei']],
				selectionItems: [['zwei']],
				acceptedItems: [['zwei']],
			}, done);
			quickPick.items = ['eins', 'zwei', 'drei'].map(label => ({ label }));
			quickPick.activeItems = [quickPick.items[1]];
			quickPick.show();

			(async () => {
				await commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
			})()
				.catch(err => done(err));
		});
	});
});

function createQuickPick(expected: QuickPickExpected, done: (err?: any) => void) {
	const quickPick = window.createQuickPick();
	quickPick.onDidChangeActive(items => {
		try {
			assert.equal('active', expected.events.shift());
			const expectedItems = expected.activeItems.shift();
			assert.deepEqual(items.map(item => item.label), expectedItems);
			assert.deepEqual(quickPick.activeItems.map(item => item.label), expectedItems);
		} catch (err) {
			done(err);
		}
	});
	quickPick.onDidChangeSelection(items => {
		try {
			assert.equal('selection', expected.events.shift());
			const expectedItems = expected.selectionItems.shift();
			assert.deepEqual(items.map(item => item.label), expectedItems);
			assert.deepEqual(quickPick.selectedItems.map(item => item.label), expectedItems);
		} catch (err) {
			done(err);
		}
	});
	quickPick.onDidAccept(() => {
		try {
			assert.equal('accept', expected.events.shift());
			const expectedItems = expected.acceptedItems.shift();
			assert.deepEqual(quickPick.activeItems.map(item => item.label), expectedItems);
			assert.deepEqual(quickPick.selectedItems.map(item => item.label), expectedItems);
			quickPick.dispose();
		} catch (err) {
			done(err);
		}
	});
	quickPick.onDidHide(() => {
		try {
			assert.equal('hide', expected.events.shift());
			done();
		} catch (err) {
			done(err);
		}
	});

	return quickPick;
}
import { Environment, RecordSource } from "relay-runtime";
import sinon from "sinon";

import { waitFor } from "coral-common/helpers";
import { parseQuery } from "coral-common/utils";
import { LOCAL_ID } from "coral-framework/lib/relay";
import { createRelayEnvironment } from "coral-framework/testHelpers";

import { commit } from "./SetCommentIDMutation";

let environment: Environment;
const source: RecordSource = new RecordSource();

beforeAll(() => {
  environment = createRelayEnvironment({
    source,
  });
});

const previousLocation = location.toString();
const previousState = window.history.state;

afterEach(() => {
  // As history will change after the listener triggers, reset this to before.
  window.history.replaceState(previousState, document.title, previousLocation);
});

it("Sets comment id", async () => {
  const id = "comment1-id";
  await commit(environment, { id }, {} as any);
  expect(source.get(LOCAL_ID)!.commentID).toEqual(id);
  expect(parseQuery(location.search).commentID).toEqual(id);
});

it("Should call setCommentID in pym", async () => {
  const id = "comment2-id";
  const context = {
    pym: {
      sendMessage: sinon.mock().once().withArgs("setCommentID", id),
    },
  };
  await commit(environment, { id }, context as any);
  await waitFor();
  expect(source.get(LOCAL_ID)!.commentID).toEqual(id);
  context.pym.sendMessage.verify();
});

it("Should call setCommentID in pym with empty id", async () => {
  const context = {
    pym: {
      sendMessage: sinon.mock().once().withArgs("setCommentID", ""),
    },
  };
  await commit(environment, { id: null }, context as any);
  await waitFor();
  expect(source.get(LOCAL_ID)!.commentID).toEqual(null);
  expect(parseQuery(location.search).commentID).toBeUndefined();
  context.pym.sendMessage.verify();
});

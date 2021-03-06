import { CoralRTE } from "@coralproject/rte";
import { Localized } from "@fluent/react/compat";
import cn from "classnames";
import { FormApi, FormState } from "final-form";
import React, {
  EventHandler,
  FunctionComponent,
  MouseEvent,
  Ref,
  useCallback,
  useState,
} from "react";
import { Field, Form, FormSpy } from "react-final-form";

import { findMediaLinks, MediaLink } from "coral-common/helpers/findMediaLinks";
import { FormError, OnSubmit } from "coral-framework/lib/form";
import { PropTypesOf } from "coral-framework/types";
import CLASSES from "coral-stream/classes";
import {
  Flex,
  HorizontalGutter,
  Icon,
  MatchMedia,
  Message,
  MessageIcon,
  RelativeTime,
} from "coral-ui/components/v2";
import { Button, CallOut } from "coral-ui/components/v3";

import { getCommentBodyValidators } from "../../helpers";
import RemainingCharactersContainer from "../../RemainingCharacters";
import RTEContainer from "../../RTE";
import MediaField from "./MediaField";

import styles from "./CommentForm.css";

export interface PasteEvent {
  fragment: DocumentFragment;
  preventDefault: () => void;
  defaultPrevented: boolean;
}

interface MediaProps {
  type: "giphy" | "twitter" | "youtube" | "external";
  url: string;
  id: string | null;
  width?: string;
  height?: string;
}

interface FormProps {
  body: string;
  media?: MediaProps;
}

interface FormSubmitProps extends FormProps, FormError {}

interface Props {
  onSubmit: OnSubmit<FormSubmitProps>;
  onChange?: (state: FormState<any>, form: FormApi) => void;
  initialValues?: FormProps;
  min: number | null;
  max: number | null;
  disabled?: boolean;
  disabledMessage?: React.ReactNode;
  bodyLabel: React.ReactNode;
  rteConfig: PropTypesOf<typeof RTEContainer>["config"];
  onFocus?: () => void;
  rteRef?: Ref<CoralRTE>;
  onCancel?: EventHandler<MouseEvent<any>>;
  editableUntil?: string;
  expired?: boolean;
  submitStatus?: React.ReactNode;
  classNameRoot: "createComment" | "editComment" | "createReplyComment";
  mediaConfig: PropTypesOf<typeof MediaField>["config"];
  placeholder: string;
  placeHolderId: string;
  bodyInputID: string;
  siteID: string;
  topBorder?: boolean;
  className?: string;
}

const CommentForm: FunctionComponent<Props> = (props) => {
  const [showGifSelector, setShowGifSelector] = useState<boolean>(false);
  const [showExternalImageInput, setShowExternalImageInput] = useState<boolean>(
    false
  );
  const [media, setMedia] = useState<MediaLink | null>(null);
  const onSubmit = useCallback(
    (values: FormSubmitProps, form: FormApi) => {
      // Unset the media.
      setMedia(null);

      // Submit the form.
      return props.onSubmit(values, form);
    },
    [props.onSubmit, setMedia]
  );

  const onPaste = useCallback(
    (event: PasteEvent) => {
      const children = event.fragment.children;
      let link = null;
      for (let i = 0; i < children.length; i++) {
        const item = children.item(i);
        if (item && item.textContent) {
          const links = findMediaLinks(item.textContent);
          if (links.length > 0) {
            link = links[0];
            break;
          }
        }
      }
      if (
        link &&
        props.mediaConfig &&
        ((link.type === "twitter" && props.mediaConfig.twitter.enabled) ||
          (link.type === "youtube" && props.mediaConfig.youtube.enabled))
      ) {
        setMedia({ ...link });
      }
    },
    [setMedia, props.mediaConfig]
  );

  const toggleExternalImageInput = useCallback(() => {
    setShowExternalImageInput(!showExternalImageInput);
    if (showGifSelector) {
      setShowGifSelector(false);
    }
  }, [showExternalImageInput, showGifSelector]);

  const toggleGIFSelector = useCallback(() => {
    setShowGifSelector(!showGifSelector);
    if (showExternalImageInput) {
      setShowExternalImageInput(false);
    }
  }, [showExternalImageInput, showGifSelector]);

  return (
    <div className={cn(CLASSES[props.classNameRoot].$root, props.className)}>
      <Form onSubmit={onSubmit} initialValues={props.initialValues}>
        {({
          handleSubmit,
          submitting,
          submitError,
          hasValidationErrors,
          form,
          pristine,
        }) => (
          <form
            autoComplete="off"
            onSubmit={handleSubmit}
            id="comments-postCommentForm-form"
          >
            <HorizontalGutter>
              <FormSpy
                onChange={(state) => {
                  return props.onChange && props.onChange(state, form);
                }}
              />
              <div>
                {props.bodyLabel}
                <div
                  className={cn(
                    styles.commentFormBox,
                    {
                      [styles.noTopBorder]: !props.topBorder,
                    },
                    CLASSES.commentForm
                  )}
                >
                  <Field
                    name="body"
                    validate={getCommentBodyValidators(props.min, props.max)}
                  >
                    {({ input }) => (
                      <Localized
                        id={props.placeHolderId}
                        attrs={{ placeholder: true }}
                      >
                        <RTEContainer
                          inputID={props.bodyInputID}
                          config={props.rteConfig}
                          onFocus={props.onFocus}
                          onWillPaste={onPaste}
                          onChange={(html: string) => {
                            input.onChange(html);
                          }}
                          value={input.value}
                          placeholder={props.placeholder}
                          disabled={submitting || props.disabled}
                          ref={props.rteRef || null}
                          toolbarButtons={
                            <>
                              {props.mediaConfig &&
                              props.mediaConfig.external.enabled ? (
                                <>
                                  <Button
                                    color="secondary"
                                    variant="flat"
                                    className={cn(styles.rteButton, {
                                      [styles.rteButtonSelected]: showExternalImageInput,
                                    })}
                                    onClick={toggleExternalImageInput}
                                    fontSize="small"
                                    paddingSize="extraSmall"
                                  >
                                    <Flex alignItems="center">
                                      <Icon size="md">add_photo_alternate</Icon>
                                    </Flex>
                                  </Button>
                                </>
                              ) : null}
                              {props.mediaConfig &&
                              props.mediaConfig.giphy.enabled ? (
                                <>
                                  <Button
                                    color="secondary"
                                    variant="flat"
                                    className={cn(styles.rteButton, {
                                      [styles.rteButtonSelected]: showGifSelector,
                                    })}
                                    onClick={toggleGIFSelector}
                                    fontSize="small"
                                    paddingSize="extraSmall"
                                  >
                                    <Flex alignItems="center">
                                      <Icon className={styles.icon}>add</Icon>
                                      GIF
                                    </Flex>
                                  </Button>
                                </>
                              ) : null}
                            </>
                          }
                        />
                      </Localized>
                    )}
                  </Field>
                  {props.mediaConfig && (
                    <MediaField
                      config={props.mediaConfig}
                      siteID={props.siteID}
                      media={media}
                      setMedia={setMedia}
                      showExternalImageInput={showExternalImageInput}
                      toggleExternalImageInput={toggleExternalImageInput}
                      showGIFSelector={showGifSelector}
                      toggleGIFSelector={toggleGIFSelector}
                    />
                  )}
                </div>
              </div>
              {!props.expired && props.editableUntil && (
                <Message
                  className={CLASSES.editComment.remainingTime}
                  fullWidth
                >
                  <MessageIcon>alarm</MessageIcon>
                  <Localized
                    id="comments-editCommentForm-editRemainingTime"
                    time={<RelativeTime date={props.editableUntil} live />}
                  >
                    <span>{"Edit: <time></time> remaining"}</span>
                  </Localized>
                </Message>
              )}
              {props.disabled ? (
                <>
                  {props.disabledMessage && (
                    <CallOut
                      className={CLASSES.editComment.expiredTime}
                      color="error"
                      title={props.disabledMessage}
                      titleWeight="semiBold"
                      icon={<Icon>error</Icon>}
                    />
                  )}
                </>
              ) : (
                <Field
                  name="body"
                  subscription={{
                    touched: true,
                    error: true,
                    submitError: true,
                    value: true,
                    dirtySinceLastSubmit: true,
                  }}
                >
                  {({
                    input: { value },
                    meta: {
                      touched,
                      error,
                      submitError: localSubmitError,
                      dirtySinceLastSubmit,
                    },
                  }) => (
                    <>
                      {touched &&
                        (error ||
                          (localSubmitError && !dirtySinceLastSubmit)) && (
                          <CallOut
                            color="error"
                            title={error || localSubmitError}
                            titleWeight="semiBold"
                            icon={<Icon>error</Icon>}
                          />
                        )}
                      {props.max && (
                        <RemainingCharactersContainer
                          value={value}
                          max={props.max}
                        />
                      )}
                    </>
                  )}
                </Field>
              )}
              {submitError && (
                <CallOut
                  color="error"
                  title={submitError}
                  titleWeight="semiBold"
                  icon={<Icon>error</Icon>}
                />
              )}
              <Flex justifyContent="flex-end" spacing={1}>
                <MatchMedia ltWidth="sm">
                  {(matches) => (
                    <>
                      {props.onCancel && (
                        <Localized id="comments-commentForm-cancel">
                          <Button
                            color="secondary"
                            variant="outlined"
                            disabled={submitting}
                            onClick={props.onCancel}
                            fullWidth={matches}
                            className={CLASSES[props.classNameRoot].cancel}
                            upperCase
                          >
                            Cancel
                          </Button>
                        </Localized>
                      )}
                      <Localized
                        id={
                          props.editableUntil
                            ? "comments-commentForm-saveChanges"
                            : "comments-commentForm-submit"
                        }
                      >
                        <Button
                          color="primary"
                          variant="filled"
                          disabled={
                            hasValidationErrors ||
                            submitting ||
                            props.disabled ||
                            (!!props.editableUntil && pristine)
                          }
                          type="submit"
                          fullWidth={matches}
                          className={CLASSES[props.classNameRoot].submit}
                          upperCase
                        >
                          {props.editableUntil ? "Save changes" : "Submit"}
                        </Button>
                      </Localized>
                    </>
                  )}
                </MatchMedia>
              </Flex>
              {props.submitStatus}
            </HorizontalGutter>
          </form>
        )}
      </Form>
    </div>
  );
};

CommentForm.defaultProps = {
  topBorder: true,
};

export default CommentForm;

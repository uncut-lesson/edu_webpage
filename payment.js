const paymentCourses = [
  { course: "Basic Course", price: "Rs 99" },
  { course: "Advanced Excel + MS-Access", price: "Rs 299" },
  { course: "Tally Prime + GST", price: "Rs 999" },
  { course: "Tally ERP", price: "Rs 999" },
  { course: "Power BI A to Z", price: "Rs 1999" },
  { course: "SAP FICO", price: "Rs 999" },
  { course: "SAP S4 HANA", price: "Rs 999" },
  { course: "Microsoft Peachtree", price: "Rs 999" },
];

const PAYMENT_REQUEST_ENDPOINT = "https://script.google.com/macros/s/AKfycbwtIBMIzUCad-KGrhOF63c6qfMiYB5z-YpQc9gFaMrrQ7_aHlWxZszeF_1anwXd0K96Eg/exec";
const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;

const getConfiguredWhatsappNumber = () => {
  const configNumber = window.UNCUT_SITE_CONFIG?.whatsappNumber || window.UNCUT_SITE_CONFIG?.supportWhatsapp;
  return String(configNumber || "917439034248").replace(/\D/g, "");
};

const getPaymentDetails = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    course: params.get("course") || "Uncut Lesson Enrollment",
    price: params.get("price") || "To be confirmed",
    referralCode: params.get("ref") || "",
  };
};

const findCourse = (courseName) => {
  return paymentCourses.find((item) => item.course.toLowerCase() === courseName.toLowerCase());
};

const getInputValue = (selector) => {
  const input = document.querySelector(selector);
  return input ? input.value.trim() : "";
};

const readScreenshotFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",").pop() : result;
      resolve(base64);
    });

    reader.addEventListener("error", () => {
      reject(new Error("Unable to read screenshot file."));
    });

    reader.readAsDataURL(file);
  });
};

window.addEventListener("DOMContentLoaded", () => {
  const courseFields = document.querySelectorAll("[data-course-name]");
  const priceFields = document.querySelectorAll("[data-course-price]");
  const whatsappLinks = document.querySelectorAll("[data-payment-whatsapp]");
  const courseSelect = document.querySelector("[data-course-select]");
  const paymentForm = document.querySelector("[data-payment-form]");
  const paymentStatus = document.querySelector("[data-payment-status]");
  const paymentSubmit = document.querySelector("[data-payment-submit]");
  const screenshotInput = document.querySelector("[data-payment-screenshot]");
  const upiField = document.querySelector("[data-upi-id]");
  const copyUpiButton = document.querySelector("[data-copy-upi]");
  const qrDownloadLink = document.querySelector(".download-qr-button");
  const upiPayLink = document.querySelector("[data-upi-pay]");
  const referralCodeInput = document.querySelector("[data-referral-code]");
  const paymentGuide = document.querySelector("[data-payment-guide]");
  const openGuideButton = document.querySelector("[data-payment-guide-open]");
  const closeGuideButton = document.querySelector("[data-payment-guide-close]");

  if (!courseFields.length && !priceFields.length && !whatsappLinks.length && !copyUpiButton && !courseSelect && !paymentForm) return;

  const initialDetails = getPaymentDetails();
  let selectedCourse = initialDetails.price && initialDetails.course
    ? initialDetails
    : findCourse(initialDetails.course) || initialDetails;

  if (referralCodeInput && initialDetails.referralCode) {
    referralCodeInput.value = initialDetails.referralCode.toUpperCase();
  }

  const buildWhatsappMessage = () => {
    const studentName = getInputValue("[data-student-name]");
    const studentEmail = getInputValue("[data-student-email]");
    const studentPhone = getInputValue("[data-student-phone]");
    const transactionId = getInputValue("[data-transaction-id]");
    const referralCode = getInputValue("[data-referral-code]");
    const lines = [
      `Hello, I paid for ${selectedCourse.course} - ${selectedCourse.price}.`,
      studentName ? `Name: ${studentName}` : "",
      studentEmail ? `Gmail for Google Drive access: ${studentEmail}` : "",
      studentPhone ? `WhatsApp: ${studentPhone}` : "",
      transactionId ? `Transaction ID / UPI Ref: ${transactionId}` : "",
      referralCode ? `Referral Code: ${referralCode}` : "",
      "I am sharing my payment screenshot.",
    ];

    return lines.filter(Boolean).join("\n");
  };

  const updatePaymentDetails = () => {
    const { course, price } = selectedCourse;
    const message = buildWhatsappMessage();
    const whatsappUrl = `https://wa.me/${getConfiguredWhatsappNumber()}?text=${encodeURIComponent(message)}`;

    courseFields.forEach((field) => {
      field.textContent = course;
    });

    priceFields.forEach((field) => {
      field.textContent = price;
    });

    whatsappLinks.forEach((link) => {
      link.setAttribute("href", whatsappUrl);
    });

    if (qrDownloadLink) {
      const safeCourseName = course.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
      qrDownloadLink.setAttribute("download", `${safeCourseName || "Uncut-Lesson"}-payment-qr.jpeg`);
    }

    if (upiPayLink && upiField) {
      const upiId = upiField.textContent.trim();
      const amount = price.replace(/[^0-9.]/g, "");
      const upiParams = new URLSearchParams({
        pa: upiId,
        pn: "Uncut Lesson",
        tn: course,
      });

      if (amount) {
        upiParams.set("am", amount);
        upiParams.set("cu", "INR");
      }

      upiPayLink.setAttribute("href", `upi://pay?${upiParams.toString()}`);
    }
  };

  if (courseSelect) {
    if (!findCourse(initialDetails.course)) {
      const option = document.createElement("option");
      option.value = initialDetails.course;
      option.textContent = `${initialDetails.course} - ${initialDetails.price}`;
      courseSelect.append(option);
    }

    paymentCourses.forEach(({ course, price }) => {
      const option = document.createElement("option");
      option.value = course;
      option.textContent = `${course} - ${price}`;
      courseSelect.append(option);
    });

    courseSelect.value = selectedCourse.course;
    courseSelect.addEventListener("change", () => {
      selectedCourse = findCourse(courseSelect.value) || {
        course: courseSelect.value,
        price: initialDetails.price,
      };

      updatePaymentDetails();
    });
  }

  updatePaymentDetails();

  if (paymentForm) {
    paymentForm.addEventListener("input", updatePaymentDetails);

    paymentForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!paymentForm.reportValidity()) return;

      if (!PAYMENT_REQUEST_ENDPOINT) {
        paymentStatus.textContent = "Google Sheet connection is not added yet. Please contact on WhatsApp after payment.";
        return;
      }

      const screenshotFile = screenshotInput && screenshotInput.files ? screenshotInput.files[0] : null;

      if (!screenshotFile) {
        paymentStatus.textContent = "Please upload your payment screenshot.";
        return;
      }

      if (screenshotFile.size > MAX_SCREENSHOT_SIZE) {
        paymentStatus.textContent = "Screenshot is too large. Please upload an image under 5 MB.";
        return;
      }

      paymentSubmit.disabled = true;
      paymentStatus.textContent = "Submitting payment details...";

      try {
        const screenshotData = await readScreenshotFile(screenshotFile);
        const payload = {
          studentName: getInputValue("[data-student-name]"),
          studentEmail: getInputValue("[data-student-email]"),
          studentPhone: getInputValue("[data-student-phone]"),
          transactionId: getInputValue("[data-transaction-id]"),
          referralCode: getInputValue("[data-referral-code]").toUpperCase(),
          course: selectedCourse.course,
          price: selectedCourse.price,
          screenshotName: screenshotFile.name,
          screenshotType: screenshotFile.type || "image/png",
          screenshotData,
        };

        await fetch(PAYMENT_REQUEST_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(payload),
        });

        paymentStatus.textContent = "Submitted. We will verify your payment and add your Gmail to Google Drive.";
        paymentForm.reset();

        if (courseSelect) {
          courseSelect.value = selectedCourse.course;
        }
      } catch (error) {
        paymentStatus.textContent = "Submission failed. Please try again or share details on WhatsApp.";
      } finally {
        paymentSubmit.disabled = false;
        updatePaymentDetails();
      }
    });
  }

  if (upiField && copyUpiButton) {
    const defaultLabel = copyUpiButton.textContent;

    copyUpiButton.addEventListener("click", async () => {
      const upiId = upiField.textContent.trim();

      try {
        await navigator.clipboard.writeText(upiId);
        copyUpiButton.textContent = "Copied";
      } catch (error) {
        const range = document.createRange();
        range.selectNodeContents(upiField);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        copyUpiButton.textContent = "Selected";
      }

      window.setTimeout(() => {
        copyUpiButton.textContent = defaultLabel;
      }, 1800);
    });
  }

  if (paymentGuide && openGuideButton && closeGuideButton) {
    const openGuide = () => {
      paymentGuide.hidden = false;
      window.requestAnimationFrame(() => {
        paymentGuide.classList.add("is-visible");
      });
    };

    const closeGuide = () => {
      paymentGuide.classList.remove("is-visible");
      window.setTimeout(() => {
        paymentGuide.hidden = true;
      }, 220);
    };

    openGuideButton.addEventListener("click", openGuide);
    closeGuideButton.addEventListener("click", closeGuide);

    paymentGuide.addEventListener("click", (event) => {
      if (event.target === paymentGuide) {
        closeGuide();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !paymentGuide.hidden) {
        closeGuide();
      }
    });
  }
});
